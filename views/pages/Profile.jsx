import { useState, useEffect } from 'react'
import { User, Mail, Star } from 'lucide-react'
import './Profile.css'

const Profile = ({ currentUser }) => {
  const [userStats, setUserStats] = useState({
    totalRatings: 0,
    averageRating: 0
  })

  useEffect(() => {
    if (!currentUser) return
    loadUserStats()
  }, [currentUser])

  const loadUserStats = async () => {
    try {
      setUserStats({
        totalRatings: 0,
        averageRating: 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Veja suas informações e estatísticas</p>
      </div>

      <div className="profile-content">
        {/* Seção de Informações Pessoais */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Informações Pessoais</h2>
          </div>
          <div className="user-info">
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
                <User size={20} />
                <div>
                  <label>Apelido</label>
                  <span>{currentUser.nickname || '-'}</span>
                </div>
              </div>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  )
}

export default Profile 