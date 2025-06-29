import { Star as StarIcon } from 'lucide-react'
import { memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './MovieCard.css'

const MovieCard = memo(({ movie, currentUser, onRateMovie, userRating = null }) => {
  const handleRateClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentUser) {
      onRateMovie(movie)
    }
  }, [currentUser, onRateMovie, movie])

  // Função para determinar a URL da imagem
  const getImageUrl = useCallback((posterPath) => {
    if (!posterPath) return null
    if (posterPath.startsWith('http')) {
      return posterPath
    }
    if (posterPath.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`
    }
    return posterPath
  }, [])

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none'
    const placeholder = e.target.nextSibling
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }, [])

  const imageUrl = getImageUrl(movie.poster_path)
  const hasRating = userRating && userRating.rating

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
      <div className="movie-poster-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={movie.title}
            loading="lazy"
            onError={handleImageError}
            className="movie-poster"
          />
        ) : null}
        <div className="placeholder-poster" style={{ display: imageUrl ? 'none' : 'flex' }}>
          <span>{movie.title}</span>
        </div>
        <div className="movie-overlay">
          <div className="movie-title-minimal">{movie.title}</div>
          {movie.genre && <div className="movie-genre-minimal">{movie.genre}</div>}
        </div>
        
        {/* Botão de avaliação */}
        {currentUser && (
          <button 
            className={`rate-button ${hasRating ? 'has-rating' : ''}`}
            onClick={handleRateClick}
            title={hasRating ? `Sua avaliação: ${userRating.rating}/5` : 'Avaliar filme'}
          >
            <StarIcon size={16} />
            {hasRating && <span className="rating-value">{userRating.rating}</span>}
          </button>
        )}
      </div>
      
      <div className="movie-info">
        {movie.vote_average > 0 && (
          <div className="movie-rating">
            <StarIcon size={12} />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>
    </Link>
  )
})

MovieCard.displayName = 'MovieCard'

export default MovieCard 