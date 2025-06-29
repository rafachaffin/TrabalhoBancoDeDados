/**
 * Movie Service
 * Serviço responsável pela lógica de negócio relacionada aos filmes
 * Adaptado para a estrutura do banco baseada no schema original
 */

import { CONFIG, getTMDBImageUrl, buildApiUrl } from '../config/api-config.js';

class MovieService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Busca filmes por categoria
   * @param {string} category - Categoria dos filmes
   * @returns {Promise<Array>} Lista de filmes
   */
  async getMoviesByCategory(category) {
    const cacheKey = `category_${category}`;
    
    // Verifica cache
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      // Simula dados do banco de dados
      const movies = await this.fetchMoviesFromDatabase(category);
      
      // Processa os dados
      const processedMovies = movies.map(movie => this.processMovieData(movie));
      
      // Armazena no cache
      this.setCache(cacheKey, processedMovies);
      
      return processedMovies;
    } catch (error) {
      console.error(`Erro ao buscar filmes da categoria ${category}:`, error);
      throw new Error(`Falha ao carregar filmes da categoria ${category}`);
    }
  }

  /**
   * Busca filmes por termo de pesquisa
   * @param {string} query - Termo de pesquisa
   * @returns {Promise<Array>} Lista de filmes filtrados
   */
  async searchMovies(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const cacheKey = `search_${searchTerm}`;
    
    // Verifica cache
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      // Busca em todas as categorias
      const allMovies = await this.getAllMovies();
      
      // Filtra os filmes
      const filteredMovies = allMovies.filter(movie =>
        movie.titulo.toLowerCase().includes(searchTerm) ||
        movie.genero.toLowerCase().includes(searchTerm) ||
        movie.produtora.toLowerCase().includes(searchTerm) ||
        movie.dataLancamento.toString().includes(searchTerm)
      );
      
      // Armazena no cache
      this.setCache(cacheKey, filteredMovies);
      
      return filteredMovies;
    } catch (error) {
      console.error('Erro na busca de filmes:', error);
      throw new Error('Falha ao realizar busca');
    }
  }

  /**
   * Obtém todos os filmes de todas as categorias
   * @returns {Promise<Array>} Lista completa de filmes
   */
  async getAllMovies() {
    const categories = ['releases', 'scifi', 'favorites'];
    const allMovies = [];
    
    for (const category of categories) {
      try {
        const movies = await this.getMoviesByCategory(category);
        allMovies.push(...movies);
      } catch (error) {
        console.error(`Erro ao buscar filmes da categoria ${category}:`, error);
      }
    }
    
    return allMovies;
  }

  /**
   * Busca filmes do banco de dados (simulado)
   * @param {string} category - Categoria dos filmes
   * @returns {Promise<Array>} Dados brutos dos filmes
   */
  async fetchMoviesFromDatabase(category) {
 

    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return movieDatabase[category] || [];
  }

  /**
   * Processa dados brutos do filme
   * @param {Object} movieData - Dados brutos do filme
   * @returns {Object} Filme processado
   */
  processMovieData(movieData) {
    return {
      id: movieData.ID_Filme,
      titulo: movieData.Titulo,
      dataLancamento: movieData.Data_Lancamento,
      duracao: movieData.Duracao,
      custo: movieData.Custo,
      sinopse: movieData.Sinopse,
      produtora: movieData.Nome_Produtora,
      genero: movieData.Nome_Genero,
      poster: getTMDBImageUrl(movieData.Poster, 'poster'),
      backdrop: getTMDBImageUrl(movieData.Poster, 'backdrop'),
      vote_average: movieData.vote_average,
      vote_count: movieData.vote_count,
      ano: new Date(movieData.Data_Lancamento).getFullYear()
    };
  }

  /**
   * Verifica se o cache é válido
   * @param {string} key - Chave do cache
   * @returns {boolean} Se o cache é válido
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  /**
   * Define dados no cache
   * @param {string} key - Chave do cache
   * @param {any} data - Dados para armazenar
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpa cache por padrão
   * @param {string} pattern - Padrão para limpar
   */
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpa todo o cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Exporta instância singleton
export const movieService = new MovieService(); 