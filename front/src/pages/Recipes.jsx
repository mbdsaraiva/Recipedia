import { useState, useEffect } from 'react';
import { recipeService, ingredientService } from '../services/api';

function Recipes({ currentUser }) {
  // estados principais
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // estados para filtros
  const [filter, setFilter] = useState('todas'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // estados para modal de detalhes
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  
  // estados para formulário de criação
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    nome: '',
    instrucoes: '',
    categoria: '',
    ingredientes: [] 
  });

  useEffect(() => {
    loadRecipes();
    loadIngredients();
  }, []);

  // carregar receitas
  const loadRecipes = async () => {
    try {
      setError(null);
      const response = await recipeService.getAll();
      setRecipes(response.data.recipes || response.data || []);
      console.log('Receitas carregadas:', response.data);
    } catch (err) {
      console.error('Erro ao carregar receitas:', err);
      setError('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  // carregar ingredientes para o formulário
  const loadIngredients = async () => {
    try {
      const response = await ingredientService.getAll();
      setIngredients(response.data);
    } catch (err) {
      console.error('Erro ao carregar ingredientes:', err);
    }
  };

  // criar nova receita
  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    
    if (!newRecipe.nome || !newRecipe.instrucoes || !newRecipe.categoria || newRecipe.ingredientes.length === 0) {
      alert('Preencha todos os campos e adicione pelo menos 1 ingrediente');
      return;
    }

    try {
      await recipeService.create({
        nome: newRecipe.nome,
        instrucoes: newRecipe.instrucoes,
        categoria: newRecipe.categoria,
        autorId: currentUser.id,
        ingredientes: newRecipe.ingredientes
      });
      
      // limpar formulário e recarregar
      setNewRecipe({
        nome: '',
        instrucoes: '',
        categoria: '',
        ingredientes: []
      });
      setShowCreateForm(false);
      await loadRecipes();
      alert('Receita criada com sucesso!');
      
    } catch (err) {
      console.error('Erro ao criar receita:', err);
      alert('Erro ao criar receita');
    }
  };

  // adicionar ingrediente ao formulário
  const addIngredientToRecipe = () => {
    setNewRecipe({
      ...newRecipe,
      ingredientes: [...newRecipe.ingredientes, { ingredientId: '', quantidade: '' }]
    });
  };

  // remover ingrediente do formulário
  const removeIngredientFromRecipe = (index) => {
    const updatedIngredients = newRecipe.ingredientes.filter((_, i) => i !== index);
    setNewRecipe({ ...newRecipe, ingredientes: updatedIngredients });
  };

  // atualizar ingrediente no formulário
  const updateRecipeIngredient = (index, field, value) => {
    const updatedIngredients = newRecipe.ingredientes.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    );
    setNewRecipe({ ...newRecipe, ingredientes: updatedIngredients });
  };

  const handleDeleteRecipe = async (recipeId, recipeName) => {
    if (!confirm(`Deletar a receita "${recipeName}"?`)) return;

    try {
      await recipeService.delete(recipeId);
      await loadRecipes();
      alert('Receita deletada com sucesso!');
      setShowRecipeModal(false);
    } catch (err) {
      console.error('Erro ao deletar receita:', err);
      alert('Erro ao deletar receita');
    }
  };

  // Filtrar receitas
  const getFilteredRecipes = () => {
    let filtered = recipes;
    
    if (filter === 'minhas') {
      filtered = filtered.filter(recipe => recipe.autorId === currentUser?.id);
    } else if (filter !== 'todas') {
      filtered = filtered.filter(recipe => 
        recipe.categoria?.toLowerCase() === filter.toLowerCase()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // obter categorias únicas
  const getCategories = () => {
    const categories = [...new Set(recipes.map(recipe => recipe.categoria).filter(Boolean))];
    return categories;
  };

  // ver detalhes da receita
  const viewRecipeDetails = async (recipe) => {
    try {
      const response = await recipeService.getById(recipe.id);
      setSelectedRecipe(response.data);
      setShowRecipeModal(true);
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
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
        <p className="text-gray-600">Carregando receitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card" style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadRecipes} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredRecipes = getFilteredRecipes();
  const categories = getCategories();

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Receitas
          </h1>
          <p className="text-gray-600">
            Descubra e compartilhe receitas deliciosas
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? 'Cancelar' : '+ Nova Receita'}
        </button>
      </div>

      {/* RESUMO ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div className="card text-center">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>
            {recipes.length}
          </h3>
          <p className="text-gray-600">Total de Receitas</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {recipes.filter(r => r.autorId === currentUser?.id).length}
          </h3>
          <p className="text-gray-600">Minhas Receitas</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
            {categories.length}
          </h3>
          <p className="text-gray-600">Categorias</p>
        </div>
      </div>

      {/* FORMULÁRIO DE CRIAR RECEITA */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Nova Receita
          </h3>
          <form onSubmit={handleCreateRecipe} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Nome da Receita</label>
                <input 
                  type="text"
                  className="input"
                  value={newRecipe.nome}
                  onChange={(e) => setNewRecipe({...newRecipe, nome: e.target.value})}
                  placeholder="Ex: Salada de Tomate"
                  required
                />
              </div>
              <div>
                <label className="label">Categoria</label>
                <input 
                  type="text"
                  className="input"
                  value={newRecipe.categoria}
                  onChange={(e) => setNewRecipe({...newRecipe, categoria: e.target.value})}
                  placeholder="Ex: salada"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="label">Instruções</label>
              <textarea 
                className="input"
                value={newRecipe.instrucoes}
                onChange={(e) => setNewRecipe({...newRecipe, instrucoes: e.target.value})}
                placeholder="1. Primeiro passo...&#10;2. Segundo passo..."
                rows="4"
                required
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            {/* INGREDIENTES */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label className="label">Ingredientes</label>
                <button 
                  type="button"
                  onClick={addIngredientToRecipe}
                  className="btn-secondary"
                  style={{ fontSize: '0.9rem' }}
                >
                  + Adicionar Ingrediente
                </button>
              </div>
              
              {newRecipe.ingredientes.map((ing, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <select
                    className="input"
                    value={ing.ingredientId}
                    onChange={(e) => updateRecipeIngredient(index, 'ingredientId', e.target.value)}
                    required
                  >
                    <option value="">Selecione o ingrediente...</option>
                    {ingredients.map(ingredient => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.nome} ({ingredient.unidade})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="input"
                    value={ing.quantidade}
                    onChange={(e) => updateRecipeIngredient(index, 'quantidade', e.target.value)}
                    placeholder="Quantidade"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientFromRecipe(index)}
                    className="btn-danger"
                    style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                  >
                    Remover
                  </button>
                </div>
              ))}
              
              {newRecipe.ingredientes.length === 0 && (
                <p className="text-gray-600" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Clique em "Adicionar Ingrediente" para começar
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary">
                Criar Receita
              </button>
              <button 
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS E BUSCA */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'center' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('todas')}
              className={filter === 'todas' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.9rem' }}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('minhas')}
              className={filter === 'minhas' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.9rem' }}
            >
              Minhas
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={filter === cat ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Busca */}
          <input
            type="text"
            className="input"
            placeholder="Buscar receitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>
      </div>

      {/* LISTA DE RECEITAS */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Receitas ({filteredRecipes.length})
        </h3>
        
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Nenhuma receita encontrada para sua busca' : 
               filter === 'minhas' ? 'Você ainda não criou nenhuma receita' :
               'Nenhuma receita encontrada'}
            </p>
            {filter === 'minhas' && !searchTerm && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Criar Primeira Receita
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem' }}>
            {filteredRecipes.map((recipe) => (
              <div 
                key={recipe.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  border: '1px solid #e5e7eb'
                }}
                onClick={() => viewRecipeDetails(recipe)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {recipe.nome}
                  </h4>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#6b7280', 
                    marginBottom: '0.75rem',
                    textTransform: 'capitalize'
                  }}>
                    {recipe.categoria} • {recipe.autor?.nome || 'Autor desconhecido'}
                  </p>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#9ca3af', 
                    marginBottom: '1rem'
                  }}>
                    {recipe.ingredientes?.length || 0} ingredientes
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      className="btn-primary"
                      style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewRecipeDetails(recipe);
                      }}
                    >
                      Ver Receita
                    </button>
                    {recipe.autorId === currentUser?.id && (
                      <button
                        className="btn-danger"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id, recipe.nome);
                        }}
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES */}
      {showRecipeModal && selectedRecipe && (
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
                {selectedRecipe.nome}
              </h2>
              <button
                onClick={() => setShowRecipeModal(false)}
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
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', textTransform: 'capitalize' }}>
                {selectedRecipe.categoria} • Por {selectedRecipe.autor?.nome}
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Ingredientes:
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
                onClick={() => setShowRecipeModal(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
              {selectedRecipe.autorId === currentUser?.id && (
                <button
                  onClick={() => handleDeleteRecipe(selectedRecipe.id, selectedRecipe.nome)}
                  className="btn-danger"
                >
                  Deletar Receita
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;