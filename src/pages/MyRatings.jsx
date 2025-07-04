import { Star, Edit, Trash2, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import RatingModal from '../components/RatingModal'
import './MyRatings.css'
import { getUserReviews, addMovieReview, deleteMovieReview } from '../services/api'

const MyRatings = ({ currentUser }) => {
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRating, setSelectedRating] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRating, setEditingRating] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      loadRatings()
    }
  }, [currentUser])

  const loadRatings = async () => {
    try {
      setLoading(true)
      const userReviews = await getUserReviews(currentUser.id)
      setRatings(userReviews)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRating = async (ratingData) => {
    try {
      await addMovieReview(ratingData.movieId, currentUser.id, ratingData.rating, ratingData.comment)
      // Após salvar, recarregar avaliações
      await loadRatings()
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      throw error
    }
  }

  const handleDeleteRating = async (movieId) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await deleteMovieReview(movieId, currentUser.id);
        await loadRatings();
      } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        alert('Erro ao excluir avaliação. Tente novamente.');
      }
    }
  }

  const handleOpenModal = () => {
    setEditingRating(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRating(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'filled' : ''}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="my-ratings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-ratings">
      <div className="ratings-header">
        <h1>Minhas Avaliações</h1>
        <p>Gerencie suas avaliações de filmes</p>
        <button className="add-rating-btn" onClick={() => navigate('/add-rating')}>
          Adicionar Avaliação
        </button>
      </div>

      {ratings.length === 0 ? (
        <div className="empty-ratings">
          <div className="empty-icon">⭐</div>
          <h3>Nenhuma avaliação ainda</h3>
          <p>Comece avaliando seus filmes favoritos!</p>
          <button className="add-rating-btn" onClick={() => navigate('/add-rating')}>
            Fazer Primeira Avaliação
          </button>
        </div>
      ) : (
        <div className="ratings-grid">
          {ratings.map((rating) => (
            <div key={rating.movieId} className="rating-card">
              <div className="rating-movie-info">
                <a
                  href={`/movie/${rating.movieId}`}
                  className="rating-movie-poster-link"
                  tabIndex={0}
                  title={`Ver detalhes de ${rating.movieTitle}`}
                >
                  <img
                    src={rating.moviePoster}
                    alt={rating.movieTitle}
                    className="rating-movie-poster"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x120/cccccc/666666?text=Sem+Imagem'
                    }}
                  />
                </a>
                <div className="rating-movie-details">
                  <h3>{rating.movieTitle}</h3>
                  <div className="rating-stars">
                    {renderStars(rating.rating)}
                    <span className="rating-value">{parseInt(rating.rating, 10)}/5</span>
                  </div>
                  {rating.comment && (
                    <p className="rating-comment">{rating.comment}</p>
                  )}
                  <div className="rating-date">
                    <Calendar size={14} />
                    <span>{formatDate(rating.date)}</span>
                  </div>
                </div>
              </div>
              
              <div className="rating-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteRating(rating.movieId)}
                  title="Excluir avaliação"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <RatingModal
          movie={editingRating ? {
            id: editingRating.movieId,
            title: editingRating.movieTitle,
            poster: editingRating.moviePoster,
            year: new Date(editingRating.date).getFullYear()
          } : null}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSaveRating={handleSaveRating}
          currentRating={editingRating}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}

export default MyRatings 