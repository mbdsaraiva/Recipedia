import { useState, useEffect } from 'react';
import { stockService, ingredientService } from '../services/api';

function MyStock({ currentUser }) {
  // Estados principais
  const [stockData, setStockData] = useState(null);
  const [ingredients, setIngredients] = useState([]); // Para o formulário
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados do formulário
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    ingredientId: '',
    quantidade: '',
    validade: ''
  });
  
  // Estados de filtro
  const [filter, setFilter] = useState('todos'); // todos, frescos, vencendo, vencidos

  useEffect(() => {
    loadStockData();
    loadIngredients();
  }, [currentUser]);

  // Carregar dados do estoque
  const loadStockData = async () => {
    if (!currentUser?.id) return;
    
    try {
      setError(null);
      const response = await stockService.getUserStock(currentUser.id);
      setStockData(response.data);
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
      if (err.response?.status === 404) {
        // Usuário não tem estoque ainda - estado inicial
        setStockData({
          user: currentUser,
          summary: { total: 0, vencidos: 0, vencendoHoje: 0, vencendoEm3Dias: 0, frescos: 0 },
          stock: { todos: [], frescos: [], vencendo: [], vencidos: [] }
        });
      } else {
        setError('Erro ao carregar estoque');
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar lista de ingredientes para o formulário
  const loadIngredients = async () => {
    try {
      const response = await ingredientService.getAll();
      setIngredients(response.data);
    } catch (err) {
      console.error('Erro ao carregar ingredientes:', err);
    }
  };

  // Adicionar item ao estoque
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.ingredientId || !newItem.quantidade || !newItem.validade) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      await stockService.addToStock(currentUser.id, {
        ingredientId: parseInt(newItem.ingredientId),
        quantidade: parseFloat(newItem.quantidade),
        validade: newItem.validade
      });
      
      // Limpar formulário e recarregar dados
      setNewItem({ ingredientId: '', quantidade: '', validade: '' });
      setShowAddForm(false);
      await loadStockData();
      
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      alert('Erro ao adicionar item ao estoque');
    }
  };

  // Consumir ingrediente
  const handleConsume = async (ingredientId, currentQuantity) => {
    const quantityToConsume = prompt(`Quanto deseja consumir? (Disponível: ${currentQuantity})`);
    
    if (!quantityToConsume || isNaN(quantityToConsume)) return;
    
    const quantity = parseFloat(quantityToConsume);
    if (quantity <= 0 || quantity > currentQuantity) {
      alert('Quantidade inválida');
      return;
    }

    try {
      await stockService.consumeIngredient(currentUser.id, ingredientId, quantity);
      await loadStockData();
    } catch (err) {
      console.error('Erro ao consumir ingrediente:', err);
      alert('Erro ao consumir ingrediente');
    }
  };

  // Remover item do estoque
  const handleRemove = async (ingredientId, ingredientName) => {
    if (!confirm(`Remover ${ingredientName} do estoque?`)) return;

    try {
      await stockService.removeItem(currentUser.id, ingredientId);
      await loadStockData();
    } catch (err) {
      console.error('Erro ao remover item:', err);
      alert('Erro ao remover item');
    }
  };

  // Filtrar itens baseado no filtro selecionado
  const getFilteredItems = () => {
    if (!stockData?.stock) return [];
    
    switch (filter) {
      case 'frescos': return stockData.stock.frescos || [];
      case 'vencendo': return [...(stockData.stock.vencendoHoje || []), ...(stockData.stock.vencendoEm3Dias || [])];
      case 'vencidos': return stockData.stock.vencidos || [];
      default: return stockData.stock.todos || [];
    }
  };

  // Determinar cor do status
  const getStatusColor = (item) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(item.validade);
    
    if (validade < hoje) return '#ef4444'; // Vencido - vermelho
    
    const em3Dias = new Date(hoje);
    em3Dias.setDate(hoje.getDate() + 3);
    
    if (validade <= em3Dias) return '#f59e0b'; // Vencendo - amarelo
    return '#10b981'; // Fresco - verde
  };

  const getStatusText = (item) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const validade = new Date(item.validade);
    
    if (validade < hoje) return 'Vencido';
    
    const em3Dias = new Date(hoje);
    em3Dias.setDate(hoje.getDate() + 3);
    
    if (validade <= em3Dias) return 'Vencendo';
    return 'Fresco';
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
        <p className="text-gray-600">Carregando seu estoque...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card" style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadStockData} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div>
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Meu Estoque
          </h1>
          <p className="text-gray-600">
            Gerencie seus ingredientes e monitore validades
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancelar' : '+ Adicionar Item'}
        </button>
      </div>

      {/* RESUMO ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div className="card text-center">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
            {stockData?.summary?.frescos || 0}
          </h3>
          <p className="text-gray-600">Frescos</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
            {(stockData?.summary?.vencendoHoje || 0) + (stockData?.summary?.vencendoEm3Dias || 0)}
          </h3>
          <p className="text-gray-600">Vencendo</p>
        </div>
        <div className="card text-center">
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
            {stockData?.summary?.vencidos || 0}
          </h3>
          <p className="text-gray-600">Vencidos</p>
        </div>
      </div>

      {/* FORMULÁRIO DE ADICIONAR */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Adicionar ao Estoque
          </h3>
          <form onSubmit={handleAddItem} style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Ingrediente</label>
                <select 
                  className="input"
                  value={newItem.ingredientId}
                  onChange={(e) => setNewItem({...newItem, ingredientId: e.target.value})}
                  required
                >
                  <option value="">Selecione...</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.nome} ({ing.unidade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Quantidade</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  className="input"
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem({...newItem, quantidade: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label">Validade</label>
                <input 
                  type="date" 
                  className="input"
                  value={newItem.validade}
                  onChange={(e) => setNewItem({...newItem, validade: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary">
                Adicionar ao Estoque
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTROS */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'frescos', label: 'Frescos' },
            { key: 'vencendo', label: 'Vencendo' },
            { key: 'vencidos', label: 'Vencidos' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={filter === filterOption.key ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.9rem' }}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE ITENS */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Itens do Estoque ({filteredItems.length})
        </h3>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {filter === 'todos' ? 'Seu estoque está vazio' : `Nenhum item ${filter}`}
            </p>
            {filter === 'todos' && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Adicionar Primeiro Item
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredItems.map((item, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  borderLeftWidth: '4px',
                  borderLeftColor: getStatusColor(item)
                }}
              >
                <div>
                  <h4 style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                    {item.ingredient?.nome}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    {item.quantidade} {item.ingredient?.unidade} • 
                    Vence: {new Date(item.validade).toLocaleDateString('pt-BR')} • 
                    <span style={{ color: getStatusColor(item), fontWeight: '500' }}>
                      {getStatusText(item)}
                    </span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleConsume(item.ingredientId, item.quantidade)}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    Consumir
                  </button>
                  <button
                    onClick={() => handleRemove(item.ingredientId, item.ingredient?.nome)}
                    className="btn-danger"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyStock;