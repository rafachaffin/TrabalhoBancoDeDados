/**
 * Middleware para tratamento centralizado de erros
 */

export const errorHandler = (err, req, res, _next) => {
  console.error('❌ Erro no servidor:', err)

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: err.message,
      details: err.details
    })
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Não autorizado',
      message: 'Token inválido ou expirado'
    })
  }

  // Erro de banco de dados
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Conflito',
      message: 'Registro já existe'
    })
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({
      error: 'Erro interno',
      message: 'Tabela não encontrada'
    })
  }

  // Erro padrão
  const status = err.status || 500
  const message = err.message || 'Erro interno do servidor'

  res.status(status).json({
    error: 'Erro interno',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Não encontrado',
    message: `Rota ${req.method} ${req.path} não encontrada`
  })
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
} 