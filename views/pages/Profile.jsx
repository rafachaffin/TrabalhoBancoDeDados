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
                  <span>{currentUser.nome}</span>
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
                  <span>{currentUser.apelido || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  )
}

export default Profile 