/**
 * Error Handler Middleware
 * Middleware para tratamento centralizado de erros
 */

/**
 * Wrapper para funções assíncronas
 * @param {Function} fn - Função assíncrona
 * @returns {Function} Função wrapped
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware de tratamento de erros
 * @param {Error} err - Erro capturado
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      message: err.message,
      details: err.details
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado',
      message: 'Token inválido ou expirado'
    });
  }

  // Erro de banco de dados
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Conflito de dados',
      message: 'Registro já existe'
    });
  }

  // Erro de conexão com banco
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Serviço indisponível',
      message: 'Erro de conexão com banco de dados'
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: 'Erro interno',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para rotas não encontradas
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    message: `Rota ${req.method} ${req.originalUrl} não existe`,
    availableRoutes: {
      movies: '/api/movies',
      auth: '/api/auth',
      search: '/api/search',
      health: '/health',
      info: '/api/info',
      stats: '/api/stats'
    }
  });
};

/**
 * Classe para erros customizados
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

/**
 * Middleware de logging de requisições
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`${logLevel} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * Middleware de validação de JSON
 * @param {Error} err - Erro de parsing JSON
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 * @param {Function} next - Próximo middleware
 */
export const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
      message: 'O corpo da requisição deve ser um JSON válido'
    });
  }
  next(err);
}; 