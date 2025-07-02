/**
 * ReviewModel
 * Modelo responsável pela lógica de negócio relacionada às avaliações
 * Gerenciamento de avaliações de filmes pelos usuários
 */

import { databaseModel } from './DatabaseModel.js';

class ReviewModel {
  constructor() {
    this.db = databaseModel;
  }

  /**
   * Adiciona uma nova avaliação
   * @param {Object} reviewData - Dados da avaliação
   * @param {number} reviewData.movieId - ID do filme
   * @param {string} reviewData.apelido - Apelido do usuário
   * @param {number} reviewData.nota - Nota da avaliação (1-10)
   * @param {string} reviewData.comentario - Comentário da avaliação
   * @returns {Promise<Object>} Resultado da inserção
   */
  async addReview(reviewData) {
    try {
      console.log('addReview - Dados recebidos:', reviewData);
      const { movieId, apelido, nota, comentario } = reviewData;
      if (!movieId || !apelido || !nota) {
        console.warn('addReview - Campos obrigatórios faltando:', { movieId, apelido, nota });
        throw new Error('ID do filme, apelido e nota são obrigatórios');
      }
      // Busca o próximo ID_Avaliacao para esse usuário+filme
      const result = await this.db.query(
        'SELECT MAX(ID_Avaliacao) as maxId FROM Avalia WHERE ID_Filme = ? AND Apelido = ?',
        [movieId, apelido]
      );
      const nextId = (result[0]?.maxId || 0) + 1;
      console.log('addReview - Próximo ID_Avaliacao:', nextId);
      const sql = `
        INSERT INTO Avalia (ID_Avaliacao, Nota, Review, Data_Avaliacao, ID_Filme, Apelido)
        VALUES (?, ?, ?, NOW(), ?, ?)
      `;
      console.log('addReview - Executando SQL:', sql, [nextId, nota, comentario, movieId, apelido]);
      const insertResult = await this.db.insert(sql, [nextId, nota, comentario, movieId, apelido]);
      console.log('addReview - Resultado da inserção:', insertResult);
      return insertResult;
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  }

  /**
   * Exclui uma avaliação
   * @param {number} movieId - ID do filme
   * @param {string} apelido - Apelido do usuário
   * @param {number} idAvaliacao - ID da avaliação
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteReview(movieId, apelido, idAvaliacao) {
    try {
      const sql = `
        DELETE FROM Avalia
        WHERE ID_Filme = ? AND Apelido = ? AND ID_Avaliacao = ?
      `;
      const result = await this.db.delete(sql, [movieId, apelido, idAvaliacao]);
      if (result.affectedRows === 0) {
        throw new Error('Avaliação não encontrada');
      }
      return result;
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      throw error;
    }
  }

  /**
   * Busca todas as avaliações de um filme
   * @param {number} movieId - ID do filme
   * @param {Object} options - Opções de busca
   * @param {number} options.limit - Limite de resultados
   * @param {number} options.offset - Offset para paginação
   * @param {string} options.sort - Ordenação (recent, rating, oldest)
   * @returns {Promise<Object>} Avaliações e metadados
   */
  async getMovieReviews(movieId, options = {}) {
    try {
      const { limit = 20, offset = 0, sort = 'recent' } = options;

      let orderBy = 'av.Data_Avaliacao DESC';
      if (sort === 'rating') {
        orderBy = 'av.Nota DESC, av.Data_Avaliacao DESC';
      } else if (sort === 'oldest') {
        orderBy = 'av.Data_Avaliacao ASC';
      }

      const sql = `
        SELECT 
          av.ID_Avaliacao,
          av.Nota,
          av.Review,
          av.Data_Avaliacao,
          u.apelido,
          u.nome
        FROM avalia av
        JOIN usuario u ON av.apelido = u.apelido
        WHERE av.ID_Filme = ?
        ORDER BY ${orderBy}
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const reviews = await this.db.query(sql, [movieId]);

      // Busca total de avaliações para paginação
      const [totalResult] = await this.db.query(
        'SELECT COUNT(*) as total FROM avalia WHERE ID_Filme = ?',
        [movieId]
      );

      return {
        reviews,
        pagination: {
          total: totalResult.total,
          limit,
          offset,
          hasMore: offset + limit < totalResult.total
        }
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações do filme:', error);
      throw new Error('Falha ao carregar avaliações do filme');
    }
  }

  /**
   * Busca todas as avaliações de um usuário
   * @param {string} apelido - Apelido do usuário
   * @param {Object} options - Opções de busca
   * @param {number} options.limit - Limite de resultados
   * @param {number} options.offset - Offset para paginação
   * @returns {Promise<Object>} Avaliações e metadados
   */
  async getUserReviews(apelido, options = {}) {
    try {
      const { limit = 20, offset = 0 } = options;

      const sql = `
        SELECT 
          av.ID_Avaliacao,
          av.Nota,
          av.Review,
          av.Data_Avaliacao,
          f.ID_Filme,
          f.Titulo,
          f.Url_Poster,
          f.Data_Lancamento
        FROM avalia av
        JOIN filme f ON av.ID_Filme = f.ID_Filme
        WHERE av.apelido = ?
        ORDER BY av.Data_Avaliacao DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const reviews = await this.db.query(sql, [apelido]);

      // Busca total de avaliações do usuário
      const [totalResult] = await this.db.query(
        'SELECT COUNT(*) as total FROM avalia WHERE apelido = ?',
        [apelido]
      );

      return {
        reviews,
        pagination: {
          total: totalResult.total,
          limit,
          offset,
          hasMore: offset + limit < totalResult.total
        }
      };
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      throw new Error('Falha ao carregar avaliações do usuário');
    }
  }

  /**
   * Valida dados da avaliação
   * @param {Object} reviewData - Dados da avaliação
   * @returns {Object} Resultado da validação
   */
  validateReviewData(reviewData) {
    const errors = [];

    if (!reviewData.movieId || reviewData.movieId <= 0) {
      errors.push('ID do filme é obrigatório e deve ser maior que zero');
    }

    if (!reviewData.apelido || reviewData.apelido.trim().length === 0) {
      errors.push('Apelido é obrigatório');
    }

    if (!reviewData.nota || reviewData.nota < 1 || reviewData.nota > 10) {
      errors.push('Nota deve estar entre 1 e 10');
    }

    if (reviewData.comentario && reviewData.comentario.length > 1000) {
      errors.push('Comentário deve ter no máximo 1000 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Exporta instância singleton
export const reviewModel = new ReviewModel();
export default ReviewModel; 