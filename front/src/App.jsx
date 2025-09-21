import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MyStock from './pages/MyStock';
import Recipes from './pages/Recipes';
import CanMake from './pages/CanMake';
import { apiUtils } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    checkApiConnection();
    // Por enquanto, vamos usar um usuário fixo
    // TODO: Implementar sistema de login
    setCurrentUser({ id: 1, nome: 'Usuário Demo' });
    setIsLoading(false);
  }, []);

  const checkApiConnection = async () => {
    try {
      await apiUtils.healthCheck();
      setApiStatus('online');
    } catch (error) {
      setApiStatus('offline');
      console.error('API não está disponível:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin" style={{ width: '3rem', height: '3rem', border: '2px solid #e5e7eb', borderTop: '2px solid #3b82f6', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
          <p className="text-gray-600">Carregando Recipedia...</p>
        </div>
      </div>
    );
  }

  if (apiStatus === 'offline') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card" style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div className="text-center">
            <div className="text-error-500 mb-4">
              <svg style={{ width: '4rem', height: '4rem', margin: '0 auto' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>API Offline</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível conectar com o servidor. Verifique se o backend está rodando na porta 3000.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header currentUser={currentUser} />

        <main className="container py-8">
          <Routes>
            <Route
              path="/"
              element={<Dashboard currentUser={currentUser} />}
            />
            <Route
              path="/stock"
              element={<MyStock currentUser={currentUser} />}
            />
            <Route
              path="/recipes"
              element={<Recipes currentUser={currentUser} />}
            />
            <Route
              path="/can-make"
              element={<CanMake currentUser={currentUser} />}
            />
            <Route
              path="*"
              element={
                <div className="text-center py-12">
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                    Página não encontrada
                  </h2>
                  <p className="text-gray-600">
                    A página que você procura não existe.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>

        <footer style={{ background: 'white', borderTop: '1px solid #e5e7eb', marginTop: '3rem' }}>
          <div className="container p-6 text-center text-gray-600">
            <p>&copy; 2024 Recipedia - Gerencie seus ingredientes e descubra receitas</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;