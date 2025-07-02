/**
 * SearchController
 * Controller responsável por gerenciar as rotas de busca
 * Pesquisa de filmes e funcionalidades relacionadas
 */

import express from 'express';
import { movieModel } from '../models/MovieModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class SearchController {
  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Configura as rotas do controller
   */
  setupRoutes() {
    // Busca geral de filmes
    this.router.get('/', asyncHandler(this.searchMovies.bind(this)));

    // Busca por gênero
    this.router.get('/genre/:genre', asyncHandler(this.searchByGenre.bind(this)));

    // Busca por produtora
    this.router.get('/studio/:studio', asyncHandler(this.searchByStudio.bind(this)));

    // Busca por ano
    this.router.get('/year/:year', asyncHandler(this.searchByYear.bind(this)));

    // Busca avançada
    this.router.post('/advanced', asyncHandler(this.advancedSearch.bind(this)));

    // Sugestões de busca
    this.router.get('/suggestions', asyncHandler(this.getSearchSuggestions.bind(this)));

    // Estatísticas de busca
    this.router.get('/stats', asyncHandler(this.getSearchStats.bind(this)));
  }

  /**
   * Busca geral de filmes
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async searchMovies(req, res) {
    try {
      const { q, limit, offset, sort } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Termo de busca deve ter pelo menos 2 caracteres'
        });
      }

      const movies = await movieModel.searchMovies(q.trim());
      
      // Aplicar ordenação
      let sortedMovies = [...movies];
      if (sort === 'title') {
        sortedMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      } else if (sort === 'year') {
        sortedMovies.sort((a, b) => b.ano - a.ano);
      } else if (sort === 'rating') {
        sortedMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      // Aplicar paginação
      const startIndex = offset ? parseInt(offset) : 0;
      const endIndex = limit ? startIndex + parseInt(limit) : movies.length;
      const paginatedMovies = sortedMovies.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedMovies,
        pagination: {
          total: movies.length,
          limit: limit ? parseInt(limit) : movies.length,
          offset: startIndex,
          hasMore: endIndex < movies.length
        },
        query: q.trim()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro na busca de filmes'
      });
    }
  }

  /**
   * Busca filmes por gênero
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async searchByGenre(req, res) {
    try {
      const { genre } = req.params;
      const { limit, offset, sort } = req.query;

      const movies = await movieModel.getMoviesByCategory(genre);
      
      // Aplicar ordenação
      let sortedMovies = [...movies];
      if (sort === 'title') {
        sortedMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      } else if (sort === 'year') {
        sortedMovies.sort((a, b) => b.ano - a.ano);
      } else if (sort === 'rating') {
        sortedMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      // Aplicar paginação
      const startIndex = offset ? parseInt(offset) : 0;
      const endIndex = limit ? startIndex + parseInt(limit) : movies.length;
      const paginatedMovies = sortedMovies.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedMovies,
        pagination: {
          total: movies.length,
          limit: limit ? parseInt(limit) : movies.length,
          offset: startIndex,
          hasMore: endIndex < movies.length
        },
        genre
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro na busca por gênero'
      });
    }
  }

  /**
   * Busca filmes por produtora
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async searchByStudio(req, res) {
    try {
      const { studio } = req.params;
      const { limit, offset, sort } = req.query;

      // Busca todos os filmes e filtra por produtora
      const allMovies = await movieModel.getMoviesByCategory('all');
      const movies = allMovies.filter(movie => 
        movie.produtora && movie.produtora.toLowerCase().includes(studio.toLowerCase())
      );
      
      // Aplicar ordenação
      let sortedMovies = [...movies];
      if (sort === 'title') {
        sortedMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      } else if (sort === 'year') {
        sortedMovies.sort((a, b) => b.ano - a.ano);
      } else if (sort === 'rating') {
        sortedMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      // Aplicar paginação
      const startIndex = offset ? parseInt(offset) : 0;
      const endIndex = limit ? startIndex + parseInt(limit) : movies.length;
      const paginatedMovies = sortedMovies.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedMovies,
        pagination: {
          total: movies.length,
          limit: limit ? parseInt(limit) : movies.length,
          offset: startIndex,
          hasMore: endIndex < movies.length
        },
        studio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro na busca por produtora'
      });
    }
  }

  /**
   * Busca filmes por ano
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async searchByYear(req, res) {
    try {
      const { year } = req.params;
      const { limit, offset, sort } = req.query;

      if (!year || isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        return res.status(400).json({
          success: false,
          error: 'Ano inválido'
        });
      }

      // Busca todos os filmes e filtra por ano
      const allMovies = await movieModel.getMoviesByCategory('all');
      const movies = allMovies.filter(movie => movie.ano === parseInt(year));
      
      // Aplicar ordenação
      let sortedMovies = [...movies];
      if (sort === 'title') {
        sortedMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      } else if (sort === 'rating') {
        sortedMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      // Aplicar paginação
      const startIndex = offset ? parseInt(offset) : 0;
      const endIndex = limit ? startIndex + parseInt(limit) : movies.length;
      const paginatedMovies = sortedMovies.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedMovies,
        pagination: {
          total: movies.length,
          limit: limit ? parseInt(limit) : movies.length,
          offset: startIndex,
          hasMore: endIndex < movies.length
        },
        year: parseInt(year)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro na busca por ano'
      });
    }
  }

  /**
   * Busca avançada com múltiplos critérios
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async advancedSearch(req, res) {
    try {
      const { 
        query, 
        genre, 
        studio, 
        yearFrom, 
        yearTo, 
        minRating, 
        maxRating,
        limit, 
        offset, 
        sort 
      } = req.body;

      // Busca todos os filmes
      const allMovies = await movieModel.getMoviesByCategory('all');
      let filteredMovies = [...allMovies];

      // Aplicar filtros
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredMovies = filteredMovies.filter(movie =>
          movie.titulo.toLowerCase().includes(searchTerm) ||
          movie.sinopse?.toLowerCase().includes(searchTerm)
        );
      }

      if (genre) {
        filteredMovies = filteredMovies.filter(movie =>
          movie.genero && movie.genero.toLowerCase().includes(genre.toLowerCase())
        );
      }

      if (studio) {
        filteredMovies = filteredMovies.filter(movie =>
          movie.produtora && movie.produtora.toLowerCase().includes(studio.toLowerCase())
        );
      }

      if (yearFrom) {
        filteredMovies = filteredMovies.filter(movie => movie.ano >= parseInt(yearFrom));
      }

      if (yearTo) {
        filteredMovies = filteredMovies.filter(movie => movie.ano <= parseInt(yearTo));
      }

      if (minRating) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.vote_average && movie.vote_average >= parseFloat(minRating)
        );
      }

      if (maxRating) {
        filteredMovies = filteredMovies.filter(movie => 
          movie.vote_average && movie.vote_average <= parseFloat(maxRating)
        );
      }

      // Aplicar ordenação
      if (sort === 'title') {
        filteredMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
      } else if (sort === 'year') {
        filteredMovies.sort((a, b) => b.ano - a.ano);
      } else if (sort === 'rating') {
        filteredMovies.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      // Aplicar paginação
      const startIndex = offset ? parseInt(offset) : 0;
      const endIndex = limit ? startIndex + parseInt(limit) : filteredMovies.length;
      const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedMovies,
        pagination: {
          total: filteredMovies.length,
          limit: limit ? parseInt(limit) : filteredMovies.length,
          offset: startIndex,
          hasMore: endIndex < filteredMovies.length
        },
        filters: {
          query,
          genre,
          studio,
          yearFrom,
          yearTo,
          minRating,
          maxRating
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro na busca avançada'
      });
    }
  }

  /**
   * Obtém sugestões de busca
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getSearchSuggestions(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 1) {
        return res.json({
          success: true,
          data: []
        });
      }

      const searchTerm = q.trim().toLowerCase();
      const allMovies = await movieModel.getMoviesByCategory('all');
      
      // Busca títulos que começam com o termo
      const titleSuggestions = allMovies
        .filter(movie => movie.titulo.toLowerCase().startsWith(searchTerm))
        .slice(0, 5)
        .map(movie => ({
          type: 'title',
          value: movie.titulo,
          id: movie.id
        }));

      // Busca gêneros que contêm o termo
      const genreSuggestions = [...new Set(allMovies
        .filter(movie => movie.genero && movie.genero.toLowerCase().includes(searchTerm))
        .map(movie => movie.genero))]
        .slice(0, 3)
        .map(genre => ({
          type: 'genre',
          value: genre
        }));

      // Busca produtoras que contêm o termo
      const studioSuggestions = [...new Set(allMovies
        .filter(movie => movie.produtora && movie.produtora.toLowerCase().includes(searchTerm))
        .map(movie => movie.produtora))]
        .slice(0, 3)
        .map(studio => ({
          type: 'studio',
          value: studio
        }));

      const suggestions = [...titleSuggestions, ...genreSuggestions, ...studioSuggestions];

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao obter sugestões'
      });
    }
  }

  /**
   * Obtém estatísticas de busca
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getSearchStats(req, res) {
    try {
      const allMovies = await movieModel.getMoviesByCategory('all');
      
      // Estatísticas por gênero
      const genreStats = {};
      allMovies.forEach(movie => {
        if (movie.genero) {
          genreStats[movie.genero] = (genreStats[movie.genero] || 0) + 1;
        }
      });

      // Estatísticas por produtora
      const studioStats = {};
      allMovies.forEach(movie => {
        if (movie.produtora) {
          studioStats[movie.produtora] = (studioStats[movie.produtora] || 0) + 1;
        }
      });

      // Estatísticas por década
      const decadeStats = {};
      allMovies.forEach(movie => {
        const decade = Math.floor(movie.ano / 10) * 10;
        decadeStats[decade] = (decadeStats[decade] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          totalMovies: allMovies.length,
          genreStats,
          studioStats,
          decadeStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao obter estatísticas de busca'
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
export const searchController = new SearchController();
export default SearchController; 