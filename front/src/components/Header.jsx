import { Link, useLocation } from 'react-router-dom';


function Header({ currentUser }) {
  // useLocation nos dá informações sobre a URL atual
  const location = useLocation();

  // Lista dos links de navegação
  const navigationLinks = [
    {
      name: 'Dashboard',
      path: '/',
      icon: '🏠'
    },
    {
      name: 'Meu Estoque',
      path: '/stock',
      icon: '📦'
    },
    {
      name: 'Receitas',
      path: '/recipes',
      icon: '📋'
    },
    {
      name: 'Posso Fazer',
      path: '/can-make',
      icon: '✨'
    }
  ];

  // Função para verificar se um link está ativo (página atual)
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="gradient-header" style={{ padding: '1rem 0' }}>
      <div className="container flex justify-between items-center">
        {/* LOGO - Lado esquerdo */}
        <div className="flex items-center">
          <Link to="/" className="text-gradient" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            🍳 Recipedia
          </Link>
        </div>

        {/* NAVEGAÇÃO - Centro */}
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          {navigationLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActiveLink(link.path) ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* USUÁRIO - Lado direito */}
        <div className="flex items-center" style={{ gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#f3f4f6',
            borderRadius: '2rem',
            fontSize: '0.9rem',
            color: 'black'
          }}>
            <span>👤</span>
            <span>Olá, {currentUser?.nome || 'Usuário'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;