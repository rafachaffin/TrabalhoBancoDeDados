import express from 'express'

import { asyncHandler } from '../middleware/errorHandler.js'
import { validateMovieId } from '../middleware/validation.js'

export default function movieRoutes(dbService) {
  const router = express.Router()

  // Buscar filmes por categoria
  router.get('/', asyncHandler(async (req, res) => {
    const { category } = req.query
    const movies = await dbService.getMoviesByCategory(category || 'all')
    res.json(movies)
  }))

  // Buscar filme por ID
  router.get('/:id', validateMovieId, asyncHandler(async (req, res) => {
    const { id } = req.params
    const movie = await dbService.getMovieById(id)
    
    if (!movie) {
      return res.status(404).json({ 
        error: 'Filme não encontrado',
        message: `Filme com ID ${id} não foi encontrado`
      })
    }
    
    res.json(movie)
  }))

  // Buscar elenco do filme
  router.get('/:id/cast', validateMovieId, asyncHandler(async (req, res) => {
    const { id } = req.params
    const cast = await dbService.getMovieCast(id)
    res.json(cast)
  }))

  // Buscar avaliações do filme
  router.get('/:id/reviews', validateMovieId, asyncHandler(async (req, res) => {
    const { id } = req.params
    const reviews = await dbService.getMovieReviews(id)
    res.json(reviews)
  }))

  // Buscar avaliações de um usuário
  router.get('/user/:apelido/reviews', asyncHandler(async (req, res) => {
    const { apelido } = req.params;
    const reviews = await dbService.getUserReviews(apelido);
    res.json(reviews);
  }))

  // Adicionar avaliação do filme
  router.post('/:id/reviews', validateMovieId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { apelido, nota, comentario } = req.body;
    await dbService.addMovieReview(id, apelido, nota, comentario);
    res.status(201).json({ message: 'Avaliação adicionada com sucesso!' });
  }))

  // Excluir avaliação do filme
  router.delete('/:id/reviews/:apelido', validateMovieId, asyncHandler(async (req, res) => {
    const { id, apelido } = req.params;
    await dbService.deleteMovieReview(id, apelido);
    res.status(200).json({ message: 'Avaliação removida com sucesso!' });
  }))

  return router
} 