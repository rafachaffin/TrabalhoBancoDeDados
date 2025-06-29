/**
 * Middleware para validação de dados
 */

export const validateMovieSearch = (req, res, next) => {
  const { q } = req.query
  
  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      error: 'Parâmetro obrigatório',
      message: 'O parâmetro "q" é obrigatório para busca'
    })
  }

  if (q.trim().length < 2) {
    return res.status(400).json({
      error: 'Busca muito curta',
      message: 'A busca deve ter pelo menos 2 caracteres'
    })
  }

  next()
}

export const validateMovieId = (req, res, next) => {
  const { id } = req.params
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      error: 'ID inválido',
      message: 'O ID do filme deve ser um número válido'
    })
  }

  next()
}

export const validateUserData = (req, res, next) => {
  const { name, email, password } = req.body

  const errors = []

  if (!name || name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres')
  }

  if (!email || !email.includes('@')) {
    errors.push('Email deve ser válido')
  }

  if (!password || password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Verifique os dados fornecidos',
      details: errors
    })
  }

  next()
}

export const validateRating = (req, res, next) => {
  const { movieId, rating, comment } = req.body

  const errors = []

  if (!movieId || isNaN(parseInt(movieId))) {
    errors.push('ID do filme deve ser um número válido')
  }

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('Avaliação deve ser um número entre 1 e 5')
  }

  if (comment && comment.length > 500) {
    errors.push('Comentário deve ter no máximo 500 caracteres')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Verifique os dados fornecidos',
      details: errors
    })
  }

  next()
} 