/**
 * MovieController
 * Controller responsável por gerenciar as rotas relacionadas aos filmes
 * Conecta as requisições HTTP com a lógica de negócio dos Models
 */

import express from 'express';
import { movieModel } from '../models/MovieModel.js';
import { reviewModel } from '../models/ReviewModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateMovieId } from '../middleware/validation.js';

class MovieController {
  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Configura as rotas do controller
   */
  setupRoutes() {
    // Buscar filmes por categoria
    this.router.get('/', asyncHandler(this.getMoviesByCategory.bind(this)));

    // Buscar filme por ID
    this.router.get('/:id', validateMovieId, asyncHandler(this.getMovieById.bind(this)));

    // Buscar elenco do filme
    this.router.get('/:id/cast', validateMovieId, asyncHandler(this.getMovieCast.bind(this)));

    // Buscar avaliações do filme
    this.router.get('/:id/reviews', validateMovieId, asyncHandler(this.getMovieReviews.bind(this)));

    // Buscar avaliações de um usuário
    this.router.get('/user/:apelido/reviews', asyncHandler(this.getUserReviews.bind(this)));

    // Adicionar avaliação do filme
    this.router.post('/:id/reviews', validateMovieId, asyncHandler(this.addMovieReview.bind(this)));

    // Atualizar avaliação do filme
    this.router.put('/:id/reviews', validateMovieId, asyncHandler(this.updateMovieReview.bind(this)));

    // Excluir avaliação do filme
    this.router.delete('/:id/reviews/:apelido', validateMovieId, asyncHandler(this.deleteMovieReview.bind(this)));

    // Estatísticas do filme
    this.router.get('/:id/stats', validateMovieId, asyncHandler(this.getMovieStats.bind(this)));
  }

  /**
   * Busca filmes por categoria
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getMoviesByCategory(req, res) {
    try {
      const { category = 'all' } = req.query;
      const movies = await movieModel.getMoviesByCategory(category);
      
      res.json({
        success: true,
        data: movies,
        count: movies.length,
        category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao buscar filmes'
      });
    }
  }

  /**
   * Busca filme por ID
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getMovieById(req, res) {
    try {
      const { id } = req.params;
      const movie = await movieModel.getMovieById(parseInt(id));
      
      if (!movie) {
        return res.status(404).json({
          success: false,
          error: 'Filme não encontrado',
          message: `Filme com ID ${id} não foi encontrado`
        });
      }
      
      res.json({
        success: true,
        data: movie
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao buscar filme'
      });
    }
  }

  /**
   * Busca elenco do filme
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getMovieCast(req, res) {
    try {
      const { id } = req.params;
      const cast = await movieModel.getMovieCast(parseInt(id));
      
      res.json({
        success: true,
        data: cast,
        count: cast.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao buscar elenco'
      });
    }
  }

  /**
   * Busca avaliações do filme
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getMovieReviews(req, res) {
    try {
      const { id } = req.params;
      const { limit, offset, sort } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
        sort: sort || 'recent'
      };

      const result = await reviewModel.getMovieReviews(parseInt(id), options);
      
      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao buscar avaliações'
      });
    }
  }

  /**
   * Busca avaliações de um usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUserReviews(req, res) {
    try {
      const { apelido } = req.params;
      const { limit, offset } = req.query;
      
      const options = {
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0
      };

      const result = await reviewModel.getUserReviews(apelido, options);
      
      res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao buscar avaliações do usuário'
      });
    }
  }

  /**
   * Adiciona avaliação do filme
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async addMovieReview(req, res) {
    try {
      const { id } = req.params;
      const { apelido, nota, comentario } = req.body;

      // Validação dos dados
      const validation = reviewModel.validateReviewData({
        movieId: parseInt(id),
        apelido,
        nota,
        comentario
      });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: validation.errors
        });
      }

      const result = await reviewModel.addReview({
        movieId: parseInt(id),
        apelido,
        nota: parseInt(nota),
        comentario
      });

      res.status(201).json({
        success: true,
        message: 'Avaliação adicionada com sucesso!',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('já avaliou') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro ao adicionar avaliação'
      });
    }
  }

  /**
   * Atualiza avaliação do filme
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async updateMovieReview(req, res) {
    try {
      const { id } = req.params;
      const { apelido, nota, comentario } = req.body;

      if (!apelido) {
        return res.status(400).json({
          success: false,
          error: 'Apelido é obrigatório'
        });
      }

      const updateData = {};
      if (nota !== undefined) updateData.nota = parseInt(nota);
      if (comentario !== undefined) updateData.comentario = comentario;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum dado para atualizar'
        });
      }

      const result = await reviewModel.updateReview(parseInt(id), apelido, updateData);

      res.json({
        success: true,
        message: 'Avaliação atualizada com sucesso!',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro ao atualizar avaliação'
      });
    }
  }

  /**
   * Exclui avaliação do filme
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async deleteMovieReview(req, res) {
    try {
      const { id, apelido } = req.params;
      const result = await reviewModel.deleteReview(parseInt(id), apelido);

      res.json({
        success: true,
        message: 'Avaliação removida com sucesso!',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro ao remover avaliação'
      });
    }
  }

  /**
   * Obtém estatísticas do filme
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getMovieStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await reviewModel.getMovieReviewStats(parseInt(id));

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao obter estatísticas do filme'
      });
    }
  }

  /**
   * Retorna o router configurado
   * @returns {Object} Router Express
   */
  getRouter() {
    return this.router;
  }
}

// Exporta instância singleton
export const movieController = new MovieController();
export default MovieController; 