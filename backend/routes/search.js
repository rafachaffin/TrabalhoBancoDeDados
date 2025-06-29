import express from 'express'

import { asyncHandler } from '../middleware/errorHandler.js'
import { validateMovieSearch } from '../middleware/validation.js'

export default function searchRoutes(dbService) {
  const router = express.Router()

  // Busca geral de filmes
  router.get('/', validateMovieSearch, asyncHandler(async (req, res) => {
    const { q, type } = req.query
    
    let results
    let searchType = 'general'

    // Se o tipo de busca foi especificado explicitamente
    if (type) {
      switch (type.toLowerCase()) {
        case 'genre':
          results = await dbService.searchMoviesByGenre(q)
          searchType = 'genre'
          break
        case 'title':
          results = await dbService.searchMoviesByTitle(q)
          searchType = 'title'
          break
        default:
          results = await dbService.searchMovies(q)
          searchType = 'general'
      }
    } else {
      // Detecta automaticamente o tipo de busca usando gêneros do banco
      const query = q.toLowerCase().trim()
      
      // Obtém gêneros do banco de dados
      const knownGenres = await dbService.getGenreNamesForDetection()

      // Verifica se a busca parece ser por gênero
      const isGenreSearch = knownGenres.some(genre => 
        query.includes(genre) || genre.includes(query)
      )

      if (isGenreSearch) {
        results = await dbService.searchMoviesByGenre(q)
        searchType = 'genre'
      } else {
        // Busca geral com scoring (prioriza títulos)
        results = await dbService.searchMovies(q)
        searchType = 'general'
      }
    }
    
    res.json({
      query: q,
      searchType,
      results,
      total: results.length,
      // Adiciona informações sobre os tipos de match encontrados
      matchTypes: results.reduce((acc, movie) => {
        if (movie.match_type) {
          acc[movie.match_type] = (acc[movie.match_type] || 0) + 1
        }
        return acc
      }, {})
    })
  }))

  return router
} 