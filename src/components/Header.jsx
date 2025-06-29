import { Search, Star, User, LogOut, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const Header = ({ currentUser, onLogout }) => {
  const location = useLocation()

  return (
    <header>
      <div className="header-content">
        <Link to="/" className="logo">
          CineBoxd
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>Início</span>
          </Link>
          
          <Link 
            to="/search" 
            className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
          >
            <Search size={20} />
            <span>Buscar</span>
          </Link>

          <Link 
            to="/my-ratings" 
            className={`nav-link ${location.pathname === '/my-ratings' ? 'active' : ''}`}
          >
            <Star size={20} />
            <span>Minhas Avaliações</span>
          </Link>

          {currentUser ? (
            <div className="user-menu">
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                title="Meu Perfil"
              >
                <User size={20} />
                <span>{currentUser.name}</span>
              </Link>
              <button className="logout-btn" onClick={onLogout} title="Sair">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              <User size={20} />
              <span>Entrar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header 