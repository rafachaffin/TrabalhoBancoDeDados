/**
 * MovieModel
 * Modelo responsável pela lógica de negócio relacionada aos filmes
 * Acesso a dados e operações CRUD para filmes
 */

import { databaseModel } from './DatabaseModel.js';
import { dbQueries } from '../config/database.js';

class MovieModel {
  constructor() {
    this.db = databaseModel;
  }

  /**
   * Busca filmes por categoria
   * @param {string} category - Categoria dos filmes
   * @returns {Promise<Array>} Lista de filmes
   */
  async getMoviesByCategory(category = 'all') {
    try {
      let sql = dbQueries.GET_ALL_MOVIES;
      let params = [];
      if (category !== 'all') {
        sql += ` HAVING FIND_IN_SET(?, Generos)`;
        params = [category];
      }
      const movies = await this.db.query(sql, params);
      return movies.map(movie => this.processMovieData(movie));
    } catch (error) {
      console.error('Erro ao buscar filmes por categoria:', error);
      throw new Error(`Falha ao carregar filmes da categoria ${category}`);
    }
  }

  /**
   * Busca filme por ID
   * @param {number} id - ID do filme
   * @returns {Promise<Object|null>} Dados do filme
   */
  async getMovieById(id) {
    try {
      const movies = await this.db.query(dbQueries.GET_MOVIE_BY_ID, [id]);
      if (movies.length === 0) {
        return null;
      }
      return this.processMovieData(movies[0]);
    } catch (error) {
      console.error('Erro ao buscar filme por ID:', error);
      throw new Error(`Falha ao carregar filme com ID ${id}`);
    }
  }

  /**
   * Busca elenco do filme
   * @param {number} movieId - ID do filme
   * @returns {Promise<Array>} Lista do elenco
   */
  async getMovieCast(movieId) {
    try {
      const cast = await this.db.query(dbQueries.GET_MOVIE_CAST, [movieId]);
      return cast;
    } catch (error) {
      console.error('Erro ao buscar elenco:', error);
      throw new Error('Falha ao carregar elenco do filme');
    }
  }

  /**
   * Busca avaliações do filme
   * @param {number} movieId - ID do filme
   * @returns {Promise<Array>} Lista de avaliações
   */
  async getMovieReviews(movieId) {
    try {
      const sql = `
        SELECT 
          av.ID_Avalia,
          av.nota,
          av.comentario,
          av.Data_Avaliacao,
          u.apelido,
          u.nome
        FROM avalia av
        JOIN usuario u ON av.apelido = u.apelido
        WHERE av.ID_Filme = ?
        ORDER BY av.Data_Avaliacao DESC
      `;

      const reviews = await this.db.query(sql, [movieId]);
      return reviews;
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      throw new Error('Falha ao carregar avaliações do filme');
    }
  }

  /**
   * Busca avaliações de um usuário
   * @param {string} apelido - Apelido do usuário
   * @returns {Promise<Array>} Lista de avaliações do usuário
   */
  async getUserReviews(apelido) {
    try {
      const sql = `
        SELECT 
          av.ID_Avalia,
          av.nota,
          av.comentario,
          av.Data_Avaliacao,
          f.ID_Filme,
          f.Titulo,
          f.Url_Poster
        FROM avalia av
        JOIN filme f ON av.ID_Filme = f.ID_Filme
        WHERE av.apelido = ?
        ORDER BY av.Data_Avaliacao DESC
      `;

      const reviews = await this.db.query(sql, [apelido]);
      return reviews.map(review => ({
        ...review,
        poster: review.Url_Poster
      }));
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      throw new Error('Falha ao carregar avaliações do usuário');
    }
  }

  /**
   * Adiciona avaliação do filme
   * @param {number} movieId - ID do filme
   * @param {string} apelido - Apelido do usuário
   * @param {number} nota - Nota da avaliação
   * @param {string} comentario - Comentário da avaliação
   * @returns {Promise<Object>} Resultado da inserção
   */
  async addMovieReview(movieId, apelido, nota, comentario) {
    try {
      const movie = await this.getMovieById(movieId);
      if (!movie) {
        throw new Error('Filme não encontrado');
      }
      const existingReview = await this.getUserMovieReview(movieId, apelido);
      if (existingReview) {
        throw new Error('Usuário já avaliou este filme');
      }
      const result = await this.db.insert(dbQueries.ADD_MOVIE_REVIEW, [movieId, apelido, nota, comentario]);
      return result;
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
      throw error;
    }
  }

  /**
   * Busca avaliação específica de um usuário para um filme
   * @param {number} movieId - ID do filme
   * @param {string} apelido - Apelido do usuário
   * @returns {Promise<Object|null>} Avaliação do usuário
   */
  async getUserMovieReview(movieId, apelido) {
    try {
      const reviews = await this.db.query(dbQueries.GET_USER_MOVIE_REVIEW, [movieId, apelido]);
      return reviews.length > 0 ? reviews[0] : null;
    } catch (error) {
      console.error('Erro ao buscar avaliação do usuário:', error);
      throw new Error('Falha ao buscar avaliação do usuário');
    }
  }

  /**
   * Exclui avaliação do filme
   * @param {number} movieId - ID do filme
   * @param {string} apelido - Apelido do usuário
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteMovieReview(movieId, apelido) {
    try {
      const result = await this.db.delete(dbQueries.DELETE_MOVIE_REVIEW, [movieId, apelido]);
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
   * Busca filmes por termo de pesquisa
   * @param {string} query - Termo de pesquisa
   * @returns {Promise<Array>} Lista de filmes filtrados
   */
  async searchMovies(query) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }
      const searchTerm = `%${query.trim()}%`;
      
      // Extrai número do termo de busca para usar como ID
      const idFilme = Number(query.trim());
      const idFilmeParam = isNaN(idFilme) ? 0 : idFilme;
      const movies = await this.db.query(
        dbQueries.SEARCH_MOVIES,
        [searchTerm, searchTerm, searchTerm, searchTerm, idFilmeParam]
      );
      // Para cada filme, buscar gêneros e produtoras separadamente
      const processedMovies = await Promise.all(
        movies.map(async (movie) => {
          const [generos] = await this.db.query(`
            SELECT GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as Generos
            FROM Filme_Genero fg
            JOIN Genero g ON fg.ID_Genero = g.ID_Genero
            WHERE fg.ID_Filme = ?
          `, [movie.ID_Filme]);
          const [produtoras] = await this.db.query(`
            SELECT GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as Produtoras
            FROM Filme_Produtora fp
            JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
            WHERE fp.ID_Filme = ?
          `, [movie.ID_Filme]);
          return {
            ...movie,
            Generos: generos.Generos || '',
            Produtoras: produtoras.Produtoras || ''
          };
        })
      );
      return processedMovies.map(movie => this.processMovieData(movie));
    } catch (error) {
      console.error('Erro na busca de filmes:', error);
      throw new Error('Falha ao realizar busca');
    }
  }

  /**
   * Processa dados brutos do filme
   * @param {Object} movieData - Dados brutos do filme
   * @returns {Object} Filme processado
   */
  processMovieData(movieData) {
    return {
      id: movieData.ID_Filme,
      title: movieData.Titulo,
      genre: movieData.Generos,
      poster: movieData.Url_Poster,
      dataLancamento: movieData.Data_Lancamento,
      duracao: movieData.Duracao,
      custo: movieData.Custo,
      sinopse: movieData.Sinopse,
      produtora: movieData.Produtoras,
      vote_average: movieData.Media_Avaliacoes,
      ano: new Date(movieData.Data_Lancamento).getFullYear()
    };
  }

  /**
   * Obtém estatísticas dos filmes
   * @returns {Promise<Object>} Estatísticas
   */
  async getMovieStats() {
    try {
      const stats = {};
      
      // Total de filmes
      const [totalMovies] = await this.db.query('SELECT COUNT(*) as count FROM filme');
      stats.totalMovies = totalMovies.count;
      
      // Média de avaliações
      const [avgRating] = await this.db.query('SELECT AVG(nota) as average FROM avalia');
      stats.averageRating = parseFloat(avgRating.average || 0).toFixed(2);
      
      // Total de avaliações
      const [totalReviews] = await this.db.query('SELECT COUNT(*) as count FROM avalia');
      stats.totalReviews = totalReviews.count;
      
      // Filmes por gênero
      const genreStats = await this.db.query(`
        SELECT g.Nome, COUNT(f.ID_Filme) as count
        FROM genero g
        LEFT JOIN filme f ON g.ID_Genero = f.ID_Genero
        GROUP BY g.ID_Genero, g.Nome
        ORDER BY count DESC
      `);
      stats.genreStats = genreStats;
      
      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas dos filmes:', error);
      throw new Error('Falha ao obter estatísticas dos filmes');
    }
  }
}

// Exporta instância singleton
export const movieModel = new MovieModel();
export default MovieModel; 