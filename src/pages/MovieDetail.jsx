import { ArrowLeft, Heart, Star, Calendar, Clock, Play } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

import { movieService } from '../services/api'
import './MovieDetail.css'

const MovieDetail = ({ 
  currentUser, 
  onRateMovie, 
  getUserRating 
}) => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cast, setCast] = useState([])
  const [reviews, setReviews] = useState([])

  const fetchMovieDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await movieService.getMovieById(id)
      setMovie(data)
      // Buscar elenco
      const elenco = await movieService.getMovieCast(id)
      setCast(elenco)
      // Buscar avaliações
      const avaliacoes = await movieService.getMovieReviews(id)
      setReviews(avaliacoes)
    } catch (err) {
      setError('Erro ao carregar detalhes do filme. Tente novamente.')
      console.error('Erro ao buscar detalhes do filme:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMovieDetails()
  }, [id, fetchMovieDetails])

  const userRating = getUserRating(id)

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="movie-detail">
        <div className="error-container">
          <h3>Ops! Algo deu errado</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchMovieDetails}>
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-detail">
        <div className="error-container">
          <h3>Filme não encontrado</h3>
          <p>O filme que você está procurando não foi encontrado.</p>
          <Link to="/" className="retry-button">
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail">
      <Link to="/" className="back-button">
        <ArrowLeft size={24} />
        Voltar
      </Link>
      <div className="movie-content">
        <div className="movie-poster-section">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="movie-poster"
            />
          ) : (
            <div className="placeholder-poster">
              <span>{movie.title}</span>
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="movie-actions-section">
            {currentUser && (
              <button 
                className="rate-movie-btn"
                onClick={() => onRateMovie(movie)}
              >
                <Star size={20} />
                {userRating ? `Editar Avaliação (${userRating.rating})` : 'Avaliar Filme'}
              </button>
            )}
          </div>

          {/* Avaliação do usuário */}
          {currentUser && userRating && (
            <div className="user-rating-display">
              <h4>Sua Avaliação</h4>
              <div className="rating-info">
                <div className="stars-display">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= userRating.rating ? 'filled' : ''}
                    />
                  ))}
                </div>
                <span className="rating-value">{userRating.rating}/5</span>
              </div>
              {userRating.comment && (
                <p className="rating-comment">"{userRating.comment}"</p>
              )}
            </div>
          )}
        </div>
        
        <div className="movie-details">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-meta">
            <div className="movie-rating">
              <Star size={20} fill="currentColor" />
              <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
              {movie.vote_count && (
                <span className="vote-count">({movie.vote_count} votos)</span>
              )}
            </div>
            <div className="movie-year">
              <Calendar size={20} />
              <span>{formatDate(movie.release_date)}</span>
            </div>
            {movie.runtime && (
              <div className="movie-duration">
                <Clock size={20} />
                <span>{formatDuration(movie.runtime)}</span>
              </div>
            )}
          </div>
          {movie.genres && movie.genres.length > 0 && (
            <div className="movie-genres">
              {movie.genres.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
          {movie.overview && (
            <div className="movie-overview">
              <h3>Sinopse</h3>
              <p>{movie.overview}</p>
            </div>
          )}
          {/* Elenco */}
          {cast && cast.length > 0 && (
            <div className="movie-cast">
              <h3>Elenco</h3>
              <ul>
                {cast.map((ator) => (
                  <li key={ator.id_ator}>
                    <strong>{ator.nome_artistico || ator.nome_ator}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <div className="movie-production">
              <h3>Produção</h3>
              <div className="production-companies">
                {movie.production_companies.map(company => (
                  <span key={company.id} className="company-tag">
                    {company.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Avaliações */}
          {reviews && reviews.length > 0 && (
            <div className="movie-reviews">
              <h3>Avaliações</h3>
              <ul>
                {reviews.map((review, idx) => (
                  <li key={idx} className="review-item">
                    <div className="review-user">{review.usuario}</div>
                    <div className="review-rating">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={16} className={star <= review.nota ? 'filled' : ''} />
                      ))}
                    </div>
                    {review.comentario && (
                      <div className="review-comment">{review.comentario}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetail 