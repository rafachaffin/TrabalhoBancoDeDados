import { useState } from 'react'

import MovieCard from '../components/MovieCard'
import { movieService } from '../services/api'
import './Search.css'

const Search = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setLoading(true)
      setError(null)
      const data = await movieService.searchMovies(query)
      setResults(data)
      setHasSearched(true)
    } catch (err) {
      setError('Erro ao buscar filmes. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setQuery('')
    setResults([])
    setError(null)
    setHasSearched(false)
  }

  const suggestions = [
    'Ação', 'Comédia', 'Drama', 'Ficção Científica', 
    'Terror', 'Romance', 'Documentário', 'Animação'
  ]

  return (
    <div className="search">
      <div className="search-header">
        <h1 className="search-title">Buscar Filmes</h1>
        <p className="search-description">
          Encontre seus filmes favoritos usando o título, gênero ou palavras-chave
        </p>
      </div>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="Digite o nome do filme..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {!hasSearched && !loading && (
        <div className="empty-state">
          <h3>Comece sua busca</h3>
          <p>Digite o nome de um filme no campo acima para começar a buscar</p>
          <div className="search-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                className="suggestion-tag"
                onClick={() => setQuery(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}
      {error && (
        <div className="error-container">
          <h3>Ops! Algo deu errado</h3>
          <p>{error}</p>
        </div>
      )}
      {hasSearched && !loading && !error && (
        <div className="search-results">
          <div className="results-header">
            <div className="results-count">
              {results.length === 1
                ? 'Encontrado 1 filme'
                : `Encontrados ${results.length} filmes`}
            </div>
            <button className="clear-search" onClick={handleClearSearch}>
              Limpar Busca
            </button>
          </div>
          {results.length > 0 ? (
            <div className="movie-grid">
              {results.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Nenhum resultado encontrado</h3>
              <p>
                Não encontramos filmes para &quot;{query}&quot;. 
                Tente usar palavras-chave diferentes ou verifique a ortografia.
              </p>
              <div className="search-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className="suggestion-tag"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search 