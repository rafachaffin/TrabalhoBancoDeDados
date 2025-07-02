/**
 * Middleware de validação
 * Funções para validar dados de entrada
 */

/**
 * Valida se o ID do filme é um número válido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validateMovieId = (req, res, next) => {
  const movieId = parseInt(req.params.id);
  
  if (isNaN(movieId) || movieId <= 0) {
    return res.status(400).json({
      error: 'ID do filme inválido',
      message: 'O ID do filme deve ser um número positivo'
    });
  }
  
  req.movieId = movieId;
  next();
};

/**
 * Valida dados de avaliação
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validateReview = (req, res, next) => {
  const { nota, comentario } = req.body;
  
  // Validar nota
  const notaNum = parseFloat(nota);
  const notasValidas = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  
  if (isNaN(notaNum) || !notasValidas.includes(notaNum)) {
    return res.status(400).json({
      error: 'Nota inválida',
      message: 'A nota deve ser um valor entre 0.5 e 5.0'
    });
  }
  
  // Validar comentário (opcional)
  if (comentario && typeof comentario !== 'string') {
    return res.status(400).json({
      error: 'Comentário inválido',
      message: 'O comentário deve ser uma string'
    });
  }
  
  if (comentario && comentario.length > 1000) {
    return res.status(400).json({
      error: 'Comentário muito longo',
      message: 'O comentário deve ter no máximo 1000 caracteres'
    });
  }
  
  req.reviewData = {
    nota: notaNum,
    comentario: comentario || null
  };
  
  next();
};

/**
 * Valida dados de usuário
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validateUser = (req, res, next) => {
  const { apelido, nome, email, senha } = req.body;
  
  // Validar apelido
  if (!apelido || typeof apelido !== 'string' || apelido.length < 3 || apelido.length > 30) {
    return res.status(400).json({
      error: 'Apelido inválido',
      message: 'O apelido deve ter entre 3 e 30 caracteres'
    });
  }
  
  // Validar nome
  if (!nome || typeof nome !== 'string' || nome.length < 2 || nome.length > 100) {
    return res.status(400).json({
      error: 'Nome inválido',
      message: 'O nome deve ter entre 2 e 100 caracteres'
    });
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Email inválido',
      message: 'Digite um email válido'
    });
  }
  
  // Validar senha
  if (!senha || typeof senha !== 'string' || senha.length < 6 || senha.length > 20) {
    return res.status(400).json({
      error: 'Senha inválida',
      message: 'A senha deve ter entre 6 e 20 caracteres'
    });
  }
  
  next();
};

/**
 * Valida dados de pesquisa
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const validateSearch = (req, res, next) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.status(400).json({
      error: 'Termo de pesquisa inválido',
      message: 'O termo de pesquisa deve ter pelo menos 2 caracteres'
    });
  }
  
  next();
}; 