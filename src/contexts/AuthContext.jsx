import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRatings, setUserRatings] = useState({})
  const [loading, setLoading] = useState(true)

  // Carrega usuário do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        loadUserRatings(user.id)
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  // Carrega avaliações do usuário
  const loadUserRatings = useCallback((userId) => {
    try {
      const ratings = JSON.parse(localStorage.getItem(`ratings_${userId}`) || '[]')
      const ratingsMap = {}
      ratings.forEach(rating => {
        ratingsMap[rating.movieId] = rating
      })
      setUserRatings(ratingsMap)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      setUserRatings({})
    }
  }, [])

  // Login do usuário
  const login = useCallback((user) => {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
    loadUserRatings(user.id)
  }, [loadUserRatings])

  // Logout do usuário
  const logout = useCallback(() => {
    setCurrentUser(null)
    setUserRatings({})
    localStorage.removeItem('currentUser')
  }, [])

  // Salvar avaliação
  const saveRating = useCallback(async (ratingData) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const userRatings = JSON.parse(localStorage.getItem(`ratings_${currentUser.id}`) || '[]')
      
      const existingRatingIndex = userRatings.findIndex(rating => rating.movieId === ratingData.movieId)
      
      if (existingRatingIndex >= 0) {
        userRatings[existingRatingIndex] = ratingData
      } else {
        userRatings.push(ratingData)
      }
      
      localStorage.setItem(`ratings_${currentUser.id}`, JSON.stringify(userRatings))
      
      const ratingsMap = {}
      userRatings.forEach(rating => {
        ratingsMap[rating.movieId] = rating
      })
      setUserRatings(ratingsMap)
      
      return ratingData
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      throw error
    }
  }, [currentUser])

  // Obter avaliação do usuário para um filme
  const getUserRating = useCallback((movieId) => {
    return userRatings[movieId] || null
  }, [userRatings])

  // Obter todas as avaliações do usuário
  const getAllUserRatings = useCallback(() => {
    return Object.values(userRatings)
  }, [userRatings])

  const value = {
    currentUser,
    userRatings,
    loading,
    login,
    logout,
    saveRating,
    getUserRating,
    getAllUserRatings,
    isAuthenticated: !!currentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 