import { useState, useEffect, useCallback } from 'react'

import { movieService } from '../services/api'

export const useMovies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMovies = useCallback(async (category = 'all') => {
    try {
      setLoading(true)
      setError(null)
      const data = await movieService.getMoviesByCategory(category)
      setMovies(Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []))
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar filmes'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const searchMovies = useCallback(async (query, type = null) => {
    try {
      setLoading(true)
      setError(null)
      const data = await movieService.searchMovies(query, type)
      setMovies(data)
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro na busca'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMovies = useCallback(() => {
    setMovies([])
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    movies,
    loading,
    error,
    fetchMovies,
    searchMovies,
    clearMovies,
    clearError
  }
}

export const useMovie = (movieId) => {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMovie = useCallback(async (id) => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await movieService.getMovieById(id)
      setMovie(data)
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar filme'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (movieId) {
      fetchMovie(movieId)
    }
  }, [movieId, fetchMovie])

  return {
    movie,
    loading,
    error,
    refetch: () => fetchMovie(movieId)
  }
} 