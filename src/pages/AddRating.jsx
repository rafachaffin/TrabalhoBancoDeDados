import { addMovieReview } from '../services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import './AddRating.css';

const AddRating = ({ currentUser }) => {
  const [search, setSearch] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearchResults([]);
    try {
      const res = await fetch(`/api/movies?query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro na busca');
      setSearchResults(data);
    } catch (err) {
      setError(err.message || 'Erro na busca');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSearchResults([]);
    setSearch('');
  };

  const handleSave = async (e) => {
    
    console.log(currentUser);
    
    e.preventDefault();
    if (!selectedMovie || rating === 0) {
      setError('Selecione um filme e uma nota!');
      return;
    }
    try {
      console.log("entrei dentro do try");
      await addMovieReview(selectedMovie.id, currentUser.id, rating, comment);
      console.log("estou depois do addMovieReview");
      navigate('/my-ratings');
    } catch (err) {
      setError('Erro ao salvar avaliação.');
    }
    
  };

  return (
    <div className="add-rating-container">
      <h1>Adicionar Avaliação</h1>
      <form onSubmit={handleSearch} className="search-movie-form">
        <input
          type="text"
          placeholder="Buscar filme pelo título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Buscar</button>
      </form>
      {loading && <p>Buscando filmes...</p>}
      {error && <p className="error-message">{error}</p>}
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map(movie => (
            <li key={movie.id} onClick={() => handleSelectMovie(movie)}>
              <img src={movie.poster_path} alt={movie.title} className="mini-poster" />
              <span>{movie.title}</span>
            </li>
          ))}
        </ul>
      )}
      {selectedMovie && (
        <form onSubmit={handleSave} className="rating-form">
          <div className="selected-movie">
            <img src={selectedMovie.poster_path} alt={selectedMovie.title} className="mini-poster" />
            <span>{selectedMovie.title}</span>
          </div>
          <div className="stars-container">
            {[1,2,3,4,5].map(star => (
              <button
                type="button"
                key={star}
                className={`star-button ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
              >
                <Star size={32} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Escreva sua crítica (opcional)"
            className="comment-textarea"
            rows="4"
            maxLength="500"
          />
          <button type="submit" className="save-btn">Salvar Avaliação</button>
        </form>
      )}
    </div>
  );
};

export default AddRating; 