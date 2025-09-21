import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stockService, recipeService, userService } from '../services/api';

function Dashboard({ currentUser }) {
  // Estados para armazenar dados da API
  const [dashboardData, setDashboardData] = useState({
    stock: null,
    expiringItems: [],
    canMakeRecipes: [],
    userInfo: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Carregando dados para usuário ID:', currentUser.id);

      let stockData = null;
      let expiringData = [];
      let canMakeData = [];
      let userData = null;

      try {
        const stockResponse = await stockService.getUserStock(currentUser.id);
        stockData = stockResponse.data;
        console.log('Stock data:', stockData);
      } catch (stockError) {
        console.log('Erro no estoque (normal se vazio):', stockError.response?.status);
      }

      try {
        const expiringResponse = await stockService.getExpiring(currentUser.id, 7);
        expiringData = expiringResponse.data?.items || [];
        console.log('Expiring data:', expiringData);
      } catch (expiringError) {
        console.log('Erro nos vencimentos (normal se vazio):', expiringError.response?.status);
      }

      try {
        const canMakeResponse = await recipeService.getCanMake(currentUser.id);
        canMakeData = canMakeResponse.data?.recipes || [];
        console.log('Can make data:', canMakeData);
      } catch (canMakeError) {
        console.log('Erro nas receitas possíveis:', canMakeError.response?.status);
      }

      try {
        const userResponse = await userService.getById(currentUser.id);
        userData = userResponse.data;
        console.log('User data:', userData);
      } catch (userError) {
        console.log('Erro nos dados do usuário:', userError.response?.status);
      }

      setDashboardData({
        stock: stockData,
        expiringItems: expiringData,
        canMakeRecipes: canMakeData,
        userInfo: userData
      });

    } catch (err) {
      console.error('Erro geral ao carregar dashboard:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTotalItems = () => dashboardData.stock?.stock?.todos?.length || 0;
  const getExpiringCount = () => dashboardData.expiringItems?.length || 0;
  const getCanMakeCount = () => dashboardData.canMakeRecipes?.length || 0;
  const getVencidosCount = () => dashboardData.stock?.stock?.vencidos?.length || 0;

  // Função para visualizar detalhes da receita
  const viewRecipeDetails = async (recipe) => {
    try {
      const response = await recipeService.getById(recipe.id);
      setSelectedRecipe(response.data);
      setShowRecipeModal(true);
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
      alert('Erro ao carregar detalhes da receita');
    }
  };

  // renderizar estado de loading
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
        <p className="text-gray-600">Carregando seus dados...</p>
      </div>
    );
  }

  // renderizar estado de erro
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card" style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* CABEÇALHO */}
      <div className="mb-4" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bem-vindo de volta, {dashboardData.userInfo?.nome || currentUser?.nome}!
        </p>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card: Itens no Estoque */}
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {getTotalItems()}
              </h3>
              <p className="text-gray-600">Itens no Estoque</p>
              {getVencidosCount() > 0 && (
                <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>
                  {getVencidosCount()} vencido(s)
                </p>
              )}
            </div>
            <div style={{ fontSize: '2rem' }}>📦</div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/stock" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
              Ver Estoque
            </Link>
          </div>
        </div>

        {/* Card: Vencendo em Breve */}
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '700',
                marginBottom: '0.25rem',
                color: getExpiringCount() > 0 ? '#f59e0b' : '#10b981'
              }}>
                {getExpiringCount()}
              </h3>
              <p className="text-gray-600">Vencendo em 7 dias</p>
            </div>
            <div style={{ fontSize: '2rem' }}>
              {getExpiringCount() > 0 ? '⚠️' : '✅'}
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/stock" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
              Ver Detalhes
            </Link>
          </div>
        </div>

        {/* Card: Receitas Possíveis */}
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {getCanMakeCount()}
              </h3>
              <p className="text-gray-600">Receitas Possíveis</p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                de {dashboardData.canMakeRecipes?.length >= 0 ?
                  (dashboardData.userInfo?.receitas?.length || 0) : 0} total
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>✨</div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/can-make" className="btn-primary" style={{ fontSize: '0.9rem' }}>
              Ver Receitas
            </Link>
          </div>
        </div>
      </div>

      {/* SEÇÃO: ALERTAS */}
      {getVencidosCount() > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#ef4444' }}>
            🚨 Ingredientes Vencidos
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {dashboardData.stock?.stock?.vencidos?.slice(0, 5).map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#fee2e2',
                  borderRadius: '0.5rem',
                  border: '1px solid #ef4444'
                }}
              >
                <div>
                  <strong>{item.ingredient?.nome}</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#7f1d1d' }}>
                    {item.quantidade} {item.ingredient?.unidade}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
                  Venceu: {new Date(item.validade).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
          {getVencidosCount() > 5 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to="/stock" className="btn-danger">
                Ver todos ({getVencidosCount()})
              </Link>
            </div>
          )}
        </div>
      )}

      {getExpiringCount() > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
            ⚠️ Ingredientes Vencendo
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {dashboardData.expiringItems.slice(0, 5).map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#fef3c7',
                  borderRadius: '0.5rem',
                  border: '1px solid #fbbf24'
                }}
              >
                <div>
                  <strong>{item.ingredient?.nome}</strong>
                  <span style={{ marginLeft: '0.5rem', color: '#7c2d12' }}>
                    {item.quantidade} {item.ingredient?.unidade}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7c2d12' }}>
                  Vence: {new Date(item.validade).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
          {dashboardData.expiringItems.length > 5 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link to="/stock" className="btn-secondary">
                Ver todos ({dashboardData.expiringItems.length})
              </Link>
            </div>
          )}
        </div>
      )}

      {/* SEÇÃO: RECEITAS SUGERIDAS */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          🍳 Receitas que Você Pode Fazer
        </h2>

        {getCanMakeCount() === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Você não tem ingredientes suficientes para nenhuma receita ainda.
            </p>
            <Link to="/stock" className="btn-primary">
              Adicionar Ingredientes
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {dashboardData.canMakeRecipes.slice(0, 3).map((recipe) => (
              <div
                key={recipe.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem'
                }}
              >
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {recipe.nome}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {recipe.categoria} • {recipe.ingredientes?.length} ingredientes
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => viewRecipeDetails(recipe)}
                    className="btn-primary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Ver Receita
                  </button>
                </div>
              </div>
            ))}

            {getCanMakeCount() > 3 && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/can-make" className="btn-secondary">
                  Ver todas ({getCanMakeCount()})
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE RECEITA */}
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

            <button
              onClick={() => setShowRecipeModal(false)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
