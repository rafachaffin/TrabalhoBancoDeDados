/**
 * API Configuration
 * Configurações para conexão com APIs externas e endpoints
 */

const API_CONFIG = {
  // The Movie Database API
  TMDB: {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: 'your_tmdb_api_key_here', // Substitua pela sua chave da API
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/',
    IMAGE_SIZES: {
      poster: 'w500',
      backdrop: 'w1280',
      profile: 'w185'
    }
  },
  
  // Configurações da aplicação
  APP: {
    BASE_URL: 'http://localhost:3000',
    TIMEOUT: 10000, // 10 segundos
    RETRY_ATTEMPTS: 3
  },
  
  // Endpoints da aplicação
  ENDPOINTS: {
    MOVIES: '/api/movies',
    SEARCH: '/api/search',
    CATEGORIES: '/api/categories',
    FAVORITES: '/api/favorites'
  }
};

// Configuração para desenvolvimento
const DEV_CONFIG = {
  ...API_CONFIG,
  APP: {
    ...API_CONFIG.APP,
    BASE_URL: 'http://localhost:3000'
  }
};

// Configuração para produção
const PROD_CONFIG = {
  ...API_CONFIG,
  APP: {
    ...API_CONFIG.APP,
    BASE_URL: 'https://your-production-domain.com'
  }
};

// Exporta a configuração baseada no ambiente
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

export const CONFIG = isDevelopment ? DEV_CONFIG : PROD_CONFIG;

// Função para obter URL completa da imagem do TMDB
export function getTMDBImageUrl(path, size = 'poster') {
  if (!path) return null;
  
  const imageSize = CONFIG.TMDB.IMAGE_SIZES[size] || CONFIG.TMDB.IMAGE_SIZES.poster;
  return `${CONFIG.TMDB.IMAGE_BASE_URL}${imageSize}${path}`;
}

// Função para construir URLs da API
export function buildApiUrl(endpoint, params = {}) {
  const url = new URL(`${CONFIG.APP.BASE_URL}${endpoint}`);
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  
  return url.toString();
} 