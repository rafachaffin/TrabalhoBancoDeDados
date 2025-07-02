import { addMovieReview } from '../services/api';
import { Star, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import './RatingModal.css'

const RatingModal = ({ movie, isOpen, onClose, onSaveRating, currentUser, currentRating = null }) => {
  const [rating, setRating] = useState(currentRating?.rating || 0)
  const [comment, setComment] = useState(currentRating?.comment || '')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentRating) {
      setRating(currentRating.rating)
      setComment(currentRating.comment)
    } else {
      setRating(0)
      setComment('')
    }
  }, [currentRating, isOpen])

  const handleSave = async () => {
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação')
      return
    }
    setLoading(true)
    try {
      const movieId = movie?.id ?? null;
      const apelido = currentUser?.apelido ?? null;
      const nota = rating ?? null;
      const comentario = comment !== undefined ? comment : null;
      await addMovieReview(movieId, apelido, nota, comentario);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStarClick = (starValue) => {
    setRating(starValue)
  }

  const handleStarHover = (starValue) => {
    setHoveredStar(starValue)
  }

  const handleStarLeave = () => {
    setHoveredStar(0)
  }

  if (!isOpen) return null

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h2>Avaliar Filme</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="movie-info">
          <img 
            src={movie.poster} 
            alt={movie.title} 
            className="movie-poster"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100x150/cccccc/666666?text=Sem+Imagem'
            }}
          />
          <div className="movie-details">
            <h3>{movie.title}</h3>
            <p>{movie.year}</p>
          </div>
        </div>

        <div className="rating-section">
          <label className="rating-label">Sua avaliação:</label>
          <div className="rating-content">
            <div className="poster-miniature">
              <img 
                src={movie.poster || movie.poster} 
                alt={movie.title} 
                className="mini-poster"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/60x90/cccccc/666666?text=Sem+Imagem'
                }}
              />
            </div>
            <div className="rating-stars-section">
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-button ${star <= (hoveredStar || rating) ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    <Star size={32} />
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating > 0 ? `${rating} estrela${rating > 1 ? 's' : ''}` : 'Selecione uma avaliação'}
              </p>
            </div>
          </div>
        </div>

        <div className="comment-section">
          <label className="comment-label">Crítica (opcional):</label>
          <div className="comment-content">
            <div className="poster-miniature">
              <img 
                src={movie.poster || movie.poster} 
                alt={movie.title} 
                className="mini-poster"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/60x90/cccccc/666666?text=Sem+Imagem'
                }}
              />
            </div>
            <div className="comment-textarea-container">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua opinião sobre o filme..."
                className="comment-textarea"
                rows="4"
                maxLength="500"
              />
              <span className="char-count">{comment.length}/500</span>
            </div>
          </div>
        </div>

        <div className="rating-modal-actions">
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={loading || rating === 0}
          >
            {loading ? 'Salvando...' : 'Salvar Avaliação'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingModal 