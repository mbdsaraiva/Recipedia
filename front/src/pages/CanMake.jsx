import { useState, useEffect } from 'react';
import { recipeService, stockService } from '../services/api';

function CanMake({ currentUser }) {
  // Estados principais
  const [canMakeRecipes, setCanMakeRecipes] = useState([]);
  const [almostCanMake, setAlmostCanMake] = useState([]);
  const [userStock, setUserStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modal de fazer receita
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showMakeRecipeModal, setShowMakeRecipeModal] = useState(false);
  
  // Estado para controlar abas
  const [activeTab, setActiveTab] = useState('posso'); // posso, quase, todas

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser]);

  // Carregar todos os dados necessários
  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Buscar dados em paralelo
      const [canMakeResponse, stockResponse, allRecipesResponse] = await Promise.all([
        recipeService.getCanMake(currentUser.id),
        stockService.getUserStock(currentUser.id).catch(() => ({ data: null })),
        recipeService.getAll()
      ]);

      const canMake = canMakeResponse.data.recipes || [];
      const stock = stockResponse.data;
      const allRecipes = allRecipesResponse.data.recipes || allRecipesResponse.data || [];

      setCanMakeRecipes(canMake);
      setUserStock(stock);

      // Calcular receitas que "quase pode fazer" (faltam 1-2 ingredientes)
      const almostRecipes = calculateAlmostCanMake(allRecipes, canMake, stock);
      setAlmostCanMake(almostRecipes);

      console.log('Can make:', canMake.length);
      console.log('Almost can make:', almostRecipes.length);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Calcular receitas que quase pode fazer
  const calculateAlmostCanMake = (allRecipes, canMakeRecipes, stock) => {
    if (!stock?.stock?.todos) return [];

    const canMakeIds = new Set(canMakeRecipes.map(r => r.id));
    const stockMap = new Map(
      stock.stock.todos.map(item => [item.ingredientId, item.quantidade])
    );

    return allRecipes
      .filter(recipe => !canMakeIds.has(recipe.id)) // Excluir receitas que já pode fazer
      .map(recipe => {
        const missing = [];
        const available = [];
        
        recipe.ingredientes?.forEach(recipeIng => {
          const stockQuantity = stockMap.get(recipeIng.ingredientId) || 0;
          if (stockQuantity >= recipeIng.quantidade) {
            available.push({
              ...recipeIng,
              stockQuantity
            });
          } else {
            missing.push({
              ...recipeIng,
              stockQuantity,
              needed: recipeIng.quantidade - stockQuantity
            });
          }
        });

        return {
          ...recipe,
          missing,
          available,
          missingCount: missing.length
        };
      })
      .filter(recipe => recipe.missingCount > 0 && recipe.missingCount <= 3) // Máximo 3 ingredientes faltando
      .sort((a, b) => a.missingCount - b.missingCount); // Ordenar por menos ingredientes faltando
  };

  // Fazer receita (consumir ingredientes)
  const handleMakeRecipe = async (recipe) => {
    if (!confirm(`Fazer a receita "${recipe.nome}"? Isso vai consumir os ingredientes do seu estoque.`)) {
      return;
    }

    try {
      // Consumir cada ingrediente necessário
      for (const recipeIng of recipe.ingredientes || []) {
        await stockService.consumeIngredient(
          currentUser.id,
          recipeIng.ingredientId,
          recipeIng.quantidade
        );
      }

      alert(`Receita "${recipe.nome}" feita com sucesso! Ingredientes consumidos do estoque.`);
      
      // Recarregar dados
      await loadData();
      setShowMakeRecipeModal(false);
      
    } catch (err) {
      console.error('Erro ao fazer receita:', err);
      alert('Erro ao fazer receita. Verifique se você tem todos os ingredientes.');
    }
  };

  // Ver detalhes da receita antes de fazer
  const viewRecipeToMake = async (recipe) => {
    try {
      const response = await recipeService.getById(recipe.id);
      setSelectedRecipe(response.data);
      setShowMakeRecipeModal(true);
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
      alert('Erro ao carregar detalhes da receita');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin" style={{
          width: '3rem', 
          height: '3rem', 
          border: '2px solid #e5e7eb', 
          borderTop: '2px solid #3b82f6', 
          borderRadius: '50%', 
          margin: '0 auto 1rem'
        }}></div>
        <p className="text-gray-600">Analisando seu estoque...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card" style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Posso Fazer
        </h1>
        <p className="text-gray-600">
          Receitas baseadas no seu estoque atual
        </p>
      </div>

      {/* RESUMO ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div className="card text-center">
          <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
            {canMakeRecipes.length}
          </h3>
          <p className="text-gray-600">Posso Fazer Agora</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
            {almostCanMake.length}
          </h3>
          <p className="text-gray-600">Quase Posso Fazer</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#6b7280' }}>
            {userStock?.stock?.todos?.length || 0}
          </h3>
          <p className="text-gray-600">Itens no Estoque</p>
        </div>
      </div>

      {/* ABAS */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('posso')}
            className={activeTab === 'posso' ? 'btn-primary' : 'btn-secondary'}
          >
            Posso Fazer ({canMakeRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('quase')}
            className={activeTab === 'quase' ? 'btn-primary' : 'btn-secondary'}
          >
            Quase Posso ({almostCanMake.length})
          </button>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {activeTab === 'posso' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Receitas que Você Pode Fazer Agora
          </h3>
          
          {canMakeRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Você não tem ingredientes suficientes para nenhuma receita ainda.
              </p>
              <p className="text-gray-600 mb-4">
                Adicione mais ingredientes ao seu estoque para desbloquear receitas!
              </p>
              <button 
                onClick={() => window.location.href = '/stock'}
                className="btn-primary"
              >
                Gerenciar Estoque
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '1rem' }}>
              {canMakeRecipes.map((recipe) => (
                <div 
                  key={recipe.id}
                  className="card"
                  style={{ 
                    border: '2px solid #10b981',
                    borderRadius: '0.75rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                      ✓ {recipe.nome}
                    </h4>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#6b7280', 
                      marginBottom: '1rem',
                      textTransform: 'capitalize'
                    }}>
                      {recipe.categoria} • {recipe.ingredientes?.length || 0} ingredientes
                    </p>
                    
                    {recipe.ingredientes && recipe.ingredientes.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                          Ingredientes necessários:
                        </p>
                        <ul style={{ fontSize: '0.85rem', color: '#6b7280', listStyle: 'disc', paddingLeft: '1.5rem' }}>
                          {recipe.ingredientes.slice(0, 3).map((ing, index) => (
                            <li key={index}>
                              {ing.quantidade} {ing.ingredient?.unidade} de {ing.ingredient?.nome}
                            </li>
                          ))}
                          {recipe.ingredientes.length > 3 && (
                            <li>+ {recipe.ingredientes.length - 3} mais...</li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => viewRecipeToMake(recipe)}
                        className="btn-secondary"
                        style={{ fontSize: '0.9rem', flex: 1 }}
                      >
                        Ver Receita
                      </button>
                      <button
                        onClick={() => handleMakeRecipe(recipe)}
                        className="btn-primary"
                        style={{ 
                          fontSize: '0.9rem', 
                          backgroundColor: '#10b981',
                          flex: 1
                        }}
                      >
                        Fazer Agora
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quase' && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Receitas que Quase Pode Fazer
          </h3>
          
          {almostCanMake.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                Todas as receitas disponíveis ou você já pode fazer, ou faltam muitos ingredientes.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {almostCanMake.map((recipe) => (
                <div 
                  key={recipe.id}
                  className="card"
                  style={{ 
                    border: '2px solid #f59e0b',
                    borderRadius: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                          {recipe.nome}
                        </h4>
                        <p style={{ 
                          fontSize: '0.9rem', 
                          color: '#6b7280',
                          textTransform: 'capitalize'
                        }}>
                          {recipe.categoria} • Falta(m) {recipe.missingCount} ingrediente(s)
                        </p>
                      </div>
                      <span style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '1rem'
                      }}>
                        Faltam {recipe.missingCount}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      {/* Ingredientes que tem */}
                      {recipe.available.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#10b981', marginBottom: '0.5rem' }}>
                            ✓ Você tem:
                          </p>
                          <ul style={{ fontSize: '0.85rem', color: '#6b7280', listStyle: 'none' }}>
                            {recipe.available.slice(0, 3).map((ing, index) => (
                              <li key={index} style={{ color: '#10b981' }}>
                                ✓ {ing.ingredient?.nome}
                              </li>
                            ))}
                            {recipe.available.length > 3 && (
                              <li style={{ color: '#6b7280' }}>+ {recipe.available.length - 3} mais...</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Ingredientes que faltam */}
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: '500', color: '#ef4444', marginBottom: '0.5rem' }}>
                          ✗ Precisa comprar:
                        </p>
                        <ul style={{ fontSize: '0.85rem', color: '#6b7280', listStyle: 'none' }}>
                          {recipe.missing.map((ing, index) => (
                            <li key={index} style={{ color: '#ef4444' }}>
                              ✗ {ing.needed > 0 ? `${ing.needed} ${ing.ingredient?.unidade}` : ''} {ing.ingredient?.nome}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => viewRecipeToMake(recipe)}
                        className="btn-secondary"
                        style={{ fontSize: '0.9rem', flex: 1 }}
                      >
                        Ver Receita
                      </button>
                      <button
                        onClick={() => {
                          const shoppingList = recipe.missing
                            .map(ing => `${ing.needed > 0 ? `${ing.needed} ${ing.ingredient?.unidade}` : ''} ${ing.ingredient?.nome}`)
                            .join('\n');
                          alert(`Lista de compras para "${recipe.nome}":\n\n${shoppingList}`);
                        }}
                        style={{ 
                          fontSize: '0.9rem', 
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          flex: 1
                        }}
                      >
                        Lista de Compras
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL PARA FAZER RECEITA */}
      {showMakeRecipeModal && selectedRecipe && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="card" style={{
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                Fazer: {selectedRecipe.nome}
              </h2>
              <button
                onClick={() => setShowMakeRecipeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #f59e0b' }}>
              <p style={{ color: '#92400e', fontSize: '0.9rem' }}>
                <strong>Atenção:</strong> Fazer esta receita vai consumir os ingredientes do seu estoque permanentemente.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Ingredientes que serão consumidos:
              </h3>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                {selectedRecipe.ingredientes?.map((ing, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    {ing.quantidade} {ing.ingredient?.unidade} de {ing.ingredient?.nome}
                  </li>
                )) || <li>Nenhum ingrediente encontrado</li>}
              </ul>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Modo de preparo:
              </h3>
              <div style={{ 
                whiteSpace: 'pre-line', 
                lineHeight: '1.6',
                backgroundColor: '#f9fafb',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                {selectedRecipe.instrucoes}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowMakeRecipeModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleMakeRecipe(selectedRecipe)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  flex: 1
                }}
              >
                Confirmar e Fazer Receita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CanMake;