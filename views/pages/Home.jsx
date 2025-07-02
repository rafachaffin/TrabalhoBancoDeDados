import { useEffect } from 'react'

import LoadingSpinner from '../components/LoadingSpinner'
import MovieCard from '../components/MovieCard'
import { useMovies } from '../hooks/useMovies'
import './Home.css'

const Home = ({ currentUser, onRateMovie, getUserRating }) => {
  const { movies, loading, error, fetchMovies } = useMovies()

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  console.log('movies do hook:', movies)

  if (loading) {
    return (
      <div className="home">
        <LoadingSpinner message="Carregando filmes..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="home">
        <div className="error-container">
          <h3>Ops! Algo deu errado</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => fetchMovies()}>
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home">
      
      <section className="section">
        <h2 className="section-title">Todos os Filmes</h2>
        {Array.isArray(movies) && movies.length > 0 ? (
          <div className="movie-grid">
            {movies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                currentUser={currentUser}
                onRateMovie={onRateMovie}
                userRating={getUserRating(movie.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Nenhum filme encontrado</h3>
            <p>Parece que não há filmes disponíveis no momento.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home 