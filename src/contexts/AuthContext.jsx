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
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('currentUser')
      }
    }
    setLoading(false)
  }, [])

  // Login do usuário
  const login = useCallback((user) => {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }, [])

  // Logout do usuário
  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }, [])

  // Salvar avaliação
  const saveRating = useCallback(async (ratingData) => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado')
    }

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ratingData)
      })

      const data = await response.json()
      setUserRatings(data.ratings)
      return data.ratings
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