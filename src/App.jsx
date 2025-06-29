import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import ErrorBoundary from './components/ErrorBoundary'
import Header from './components/Header'
import RatingModal from './components/RatingModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import MovieDetail from './pages/MovieDetail'
import MyRatings from './pages/MyRatings'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Search from './pages/Search'
import AddRating from './pages/AddRating'
import './App.css'

// Componente interno que usa o contexto
const AppContent = () => {
  const { currentUser, logout, getUserRating, saveRating } = useAuth()
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)

  const handleRateMovie = (movie) => {
    setSelectedMovie(movie)
    setIsRatingModalOpen(true)
  }

  const handleSaveRating = async (ratingData) => {
    try {
      await saveRating(ratingData)
      setIsRatingModalOpen(false)
      setSelectedMovie(null)
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      throw error
    }
  }

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false)
    setSelectedMovie(null)
  }

  return (
    <div className="app">
      <Header 
        currentUser={currentUser}
        onLogout={logout}
      />
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                currentUser={currentUser}
                onRateMovie={handleRateMovie}
                getUserRating={getUserRating}
              />
            } 
          />
          <Route 
            path="/search" 
            element={
              <Search 
                currentUser={currentUser}
                onRateMovie={handleRateMovie}
                getUserRating={getUserRating}
              />
            } 
          />
          <Route 
            path="/movie/:id" 
            element={
              <MovieDetail 
                currentUser={currentUser}
                onRateMovie={handleRateMovie}
                getUserRating={getUserRating}
              />
            } 
          />
          <Route 
            path="/login" 
            element={<Login />}
          />
          <Route 
            path="/register" 
            element={<Register />}
          />
          <Route 
            path="/my-ratings" 
            element={
              currentUser ? (
                <MyRatings currentUser={currentUser} />
              ) : (
                <div className="auth-required">
                  <h2>Login Necessário</h2>
                  <p>Faça login para ver suas avaliações</p>
                </div>
              )
            } 
          />
          <Route 
            path="/profile" 
            element={
              currentUser ? (
                <Profile currentUser={currentUser} onLogout={logout} />
              ) : (
                <div className="auth-required">
                  <h2>Login Necessário</h2>
                  <p>Faça login para acessar seu perfil</p>
                </div>
              )
            } 
          />
          <Route 
            path="/add-rating" 
            element={
              currentUser ? (
                <AddRating onSaveRating={saveRating} />
              ) : (
                <div className="auth-required">
                  <h2>Login Necessário</h2>
                  <p>Faça login para adicionar avaliações</p>
                </div>
              )
            } 
          />
        </Routes>
      </main>

      {/* Modal de Avaliação */}
      {isRatingModalOpen && selectedMovie && (
        <RatingModal
          movie={selectedMovie}
          isOpen={isRatingModalOpen}
          onClose={handleCloseRatingModal}
          onSaveRating={handleSaveRating}
          currentRating={getUserRating(selectedMovie.id)}
          moviePoster={getImageUrl(selectedMovie.poster_path)}
        />
      )}
    </div>
  )
}

// Componente principal com providers
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

function getImageUrl(posterPath) {
  if (!posterPath) return 'https://via.placeholder.com/80x120/cccccc/666666?text=Sem+Imagem';
  if (posterPath.startsWith('http')) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

export default App 