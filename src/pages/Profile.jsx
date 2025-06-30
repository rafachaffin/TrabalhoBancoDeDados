import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, Star, LogOut, Edit, Camera } from 'lucide-react'
import './Profile.css'
import { getUserReviews } from '../services/api'

const Profile = ({ currentUser, onLogout }) => {
  const navigate = useNavigate()
  const [userStats, setUserStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    favoriteGenres: [],
    joinDate: null
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    
    loadUserStats()
  }, [currentUser, navigate])

  const loadUserStats = async () => {
    try {
      const reviews = await getUserReviews(currentUser.id)
      const totalRatings = reviews.length
      const averageRating = totalRatings > 0
        ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalRatings).toFixed(2)
        : 0

      // Gêneros favoritos (contagem dos gêneros mais avaliados)
      const genreCount = {}
      reviews.forEach(r => {
        if (r.genres && Array.isArray(r.genres)) {
          r.genres.forEach(g => {
            genreCount[g.name] = (genreCount[g.name] || 0) + 1
          })
        } else if (r.genre) {
          // fallback se vier só um gênero
          genreCount[r.genre] = (genreCount[r.genre] || 0) + 1
        }
      })
      const favoriteGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)

      setUserStats({
        totalRatings,
        averageRating,
        favoriteGenres,
        joinDate: currentUser.joinDate || new Date().toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Aqui você faria a chamada para a API para atualizar os dados
      // Por enquanto, vamos apenas simular
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar dados no localStorage
      const updatedUser = { ...currentUser, ...editForm }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
      setIsEditing(false)
      setLoading(false)
      
      // Recarregar a página para refletir as mudanças
      window.location.reload()
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    onLogout()
    navigate('/')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações e veja suas estatísticas</p>
      </div>

      <div className="profile-content">
        {/* Seção de Informações Pessoais */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Informações Pessoais</h2>
            <button 
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit size={16} />
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Nome</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleChange}
                    className="profile-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                    className="profile-input"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="user-info">
              <div className="avatar-section">
                <div className="avatar">
                  <User size={40} />
                  <button className="avatar-edit">
                    <Camera size={16} />
                  </button>
                </div>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <User size={20} />
                  <div>
                    <label>Nome</label>
                    <span>{currentUser.name}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Mail size={20} />
                  <div>
                    <label>Email</label>
                    <span>{currentUser.email}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Calendar size={20} />
                  <div>
                    <label>Membro desde</label>
                    <span>{userStats.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Estatísticas */}
        <div className="profile-section">
          <h2>Minhas Estatísticas</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <h3>{userStats.totalRatings}</h3>
                <p>Filmes Avaliados</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <h3>{userStats.averageRating}</h3>
                <p>Média das Avaliações</p>
              </div>
            </div>
          </div>

          {userStats.favoriteGenres.length > 0 && (
            <div className="favorite-genres">
              <h3>Gêneros Favoritos</h3>
              <div className="genre-tags">
                {userStats.favoriteGenres.map((genre, index) => (
                  <span key={index} className="genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Logout */}
        <div className="profile-section">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile 