import axios from 'axios'

// Configuração da API
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000')

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentado para 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

// Classe para erros customizados da API
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('Erro na requisição:', error)
    return Promise.reject(new ApiError('Erro na requisição', null, error))
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Log apenas em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    const { response } = error
    
    let errorMessage = 'Erro desconhecido'
    let status = null
    
    if (response) {
      status = response.status
      errorMessage = response.data?.message || response.data?.error || `Erro ${status}`
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout na requisição'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    console.error('Erro na resposta:', errorMessage)
    return Promise.reject(new ApiError(errorMessage, status, response?.data))
  }
)

// Função utilitária para validar parâmetros
const validateParams = (params, required = []) => {
  const missing = required.filter(param => !params[param])
  if (missing.length > 0) {
    throw new ApiError(`Parâmetros obrigatórios: ${missing.join(', ')}`, 400)
  }
}

export const movieService = {
  // Buscar filmes por categoria
  async getMoviesByCategory(category = 'all') {
    try {
      const response = await api.get('/api/movies', {
        params: { category }
      })
      return response.data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro ao buscar filmes', null, error)
    }
  },

  // Buscar todos os filmes
  async getAllMovies() {
    return this.getMoviesByCategory('all')
  },

  // Buscar filme por ID
  async getMovieById(movieId) {
    try {
      validateParams({ movieId }, ['movieId'])
      
      const response = await api.get(`/api/movies/${movieId}`)
      const { data } = response.data
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro ao buscar filme', null, error)
    }
  },

  // Buscar filmes por termo
  async searchMovies(query, type = null) {
    try {
      validateParams({ query }, ['query'])
      
      const params = { q: query }
      if (type) params.type = type
      
      const response = await api.get('/api/search', { params })
      
      const {data} = response.data
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro na busca de filmes', null, error)
    }
  },

  // Obter estatísticas
  async getStats() {
    try {
      const response = await api.get('/api/stats')
      const {data} = response.data
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro ao obter estatísticas', null, error)
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro no health check', null, error)
    }
  },

  // Buscar elenco do filme
  async getMovieCast(movieId) {
    try {
      validateParams({ movieId }, ['movieId'])
      const response = await api.get(`/api/movies/${movieId}/cast`)
      const {data} = response.data
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro ao buscar elenco', null, error)
    }
  },

  // Buscar avaliações do filme
  async getMovieReviews(movieId) {
    try {
      validateParams({ movieId }, ['movieId'])
      const response = await api.get(`/api/movies/${movieId}/reviews`)
      const {data} = response.data;
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro ao buscar avaliações', null, error)
    }
  }
}

export const authService = {
  // Registrar usuário
  async register(userData) {
    try {
      validateParams(userData, ['name', 'email', 'password'])
      
      const response = await api.post('/api/auth/register', userData)
      const {data} = response.data;
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro no registro', null, error)
    }
  },

  // Login do usuário
  async login(credentials) {
    try {
      validateParams(credentials, ['apelido', 'password'])
      const response = await api.post('/api/auth/login', credentials)
      const {data} = response.data;
      return data
    } catch (error) {
      throw error instanceof ApiError ? error : new ApiError('Erro no login', null, error)
    }
  }
}

export async function addMovieReview(movieId, apelido, nota, comentario) {
  
  return api.post(`/api/movies/${movieId}/reviews`, { apelido, nota, comentario });
}

export async function getUserReviews(apelido) {
  const response = await api.get(`/api/movies/user/${apelido}/reviews`);
  const {data} = response.data;
  return data
}

export async function deleteMovieReview(movieId, apelido, idAvaliacao) {
  return api.delete(`/api/movies/${movieId}/reviews/${apelido}/${idAvaliacao}`);
}

export { ApiError }
export default api 