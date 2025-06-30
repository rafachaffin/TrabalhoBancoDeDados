import { getDatabaseConnection } from '../../database/connection.js';

class DatabaseService {
  constructor() {
    this.db = null;
    this.genresCache = null;
    this.genresCacheTimeout = 10 * 60 * 1000; // 10 minutos
    this.genresCacheTimestamp = 0;
  }

  async initialize() {
    try {
      this.db = getDatabaseConnection();
      await this.db.connect();
      console.log('✅ Serviço de banco de dados inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de banco:', error);
      throw error;
    }
  }

  /**
   * Busca filmes por categoria
   */
  async getMoviesByCategory(category) {
    try {
      let whereClause = '';
      let orderClause = 'ORDER BY f.Data_Lancamento DESC';
      let limitClause = 'LIMIT 20';
      const params = [];

      switch (category) {
        case 'releases':
          // Filmes com maior avaliação média
          whereClause = 'HAVING vote_average > 0';
          orderClause = 'ORDER BY vote_average DESC, vote_count DESC';
          limitClause = 'LIMIT 10';
          break;

        case 'favorites':
          // Filmes mais bem avaliados
          whereClause = 'HAVING vote_average > 0';
          orderClause = 'ORDER BY vote_average DESC, vote_count DESC';
          limitClause = 'LIMIT 10';
          break;

        default:
          // Para qualquer outra categoria (incluindo 'scifi'), usa o nome do gênero
          if (category && category !== 'all') {
            whereClause = 'WHERE g.Nome LIKE ?';
            params.push(`%${category}%`);
            limitClause = 'LIMIT 10';
          }
          break;
      }

      const query = `
        SELECT 
          f.ID_Filme as id,
          f.Titulo as title,
          f.Data_Lancamento as release_date,
          f.Duracao as runtime,
          f.Sinopse as overview,
          f.Url_Poster as poster_path,
          GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as genres,
          GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as production_companies,
          COALESCE(AVG(a.Nota), 0) as vote_average,
          COUNT(a.ID_Avaliacao) as vote_count
        FROM Filme f
        LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
        LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
        LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
        LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
        LEFT JOIN Avalia a ON f.ID_Filme = a.ID_Filme
        ${whereClause}
        GROUP BY f.ID_Filme, f.Titulo, f.Data_Lancamento, f.Duracao, f.Sinopse, f.Url_Poster
        ${orderClause}
        ${limitClause}
      `;

      const movies = await this.db.query(query, params);
      
      // Processa os dados para o formato esperado pelo frontend
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        runtime: movie.runtime,
        overview: movie.overview,
        poster_path: movie.poster_path,
        vote_average: parseFloat(movie.vote_average),
        vote_count: movie.vote_count,
        genre: movie.genres ? movie.genres.split(', ')[0] : null, // Primeiro gênero como principal
        genres: movie.genres ? movie.genres.split(', ').map((name, index) => ({ id: index + 1, name })) : [],
        production_companies: movie.production_companies ? movie.production_companies.split(', ').map((name, index) => ({ id: index + 1, name })) : []
      }));

    } catch (error) {
      console.error('Erro ao buscar filmes por categoria:', error);
      throw error;
    }
  }

  /**
   * Busca filmes por termo
   */
  async searchMovies(query) {
    try {
      // Busca com scoring para priorizar títulos sobre gêneros
      const searchQuery = `
        SELECT 
          f.ID_Filme as id,
          f.Titulo as title,
          f.Data_Lancamento as release_date,
          f.Duracao as runtime,
          f.Sinopse as overview,
          f.Url_Poster as poster_path,
          GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as genres,
          GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as production_companies,
          COALESCE(AVG(a.Nota), 0) as vote_average,
          COUNT(a.ID_Avaliacao) as vote_count,
          CASE 
            WHEN f.Titulo LIKE ? THEN 100  -- Match exato no título
            WHEN f.Titulo LIKE ? THEN 80   -- Match parcial no título
            WHEN EXISTS (
              SELECT 1 FROM Filme_Genero fg2 
              JOIN Genero g2 ON fg2.ID_Genero = g2.ID_Genero 
              WHERE fg2.ID_Filme = f.ID_Filme AND g2.Nome LIKE ?
            ) THEN 60     -- Match no gênero
            WHEN EXISTS (
              SELECT 1 FROM Filme_Produtora fp2 
              JOIN Produtora p2 ON fp2.ID_Produtora = p2.ID_Produtora 
              WHERE fp2.ID_Filme = f.ID_Filme AND p2.Nome_Produtora LIKE ?
            ) THEN 40  -- Match na produtora
            WHEN YEAR(f.Data_Lancamento) LIKE ? THEN 30  -- Match no ano
            ELSE 0
          END as search_score,
          CASE 
            WHEN f.Titulo LIKE ? THEN 'title'
            WHEN EXISTS (
              SELECT 1 FROM Filme_Genero fg2 
              JOIN Genero g2 ON fg2.ID_Genero = g2.ID_Genero 
              WHERE fg2.ID_Filme = f.ID_Filme AND g2.Nome LIKE ?
            ) THEN 'genre'
            WHEN EXISTS (
              SELECT 1 FROM Filme_Produtora fp2 
              JOIN Produtora p2 ON fp2.ID_Produtora = p2.ID_Produtora 
              WHERE fp2.ID_Filme = f.ID_Filme AND p2.Nome_Produtora LIKE ?
            ) THEN 'production'
            WHEN YEAR(f.Data_Lancamento) LIKE ? THEN 'year'
            ELSE 'other'
          END as match_type
        FROM Filme f
        LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
        LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
        LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
        LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
        LEFT JOIN Avalia a ON f.ID_Filme = a.ID_Filme
        WHERE 
          f.Titulo LIKE ? OR 
          EXISTS (
            SELECT 1 FROM Filme_Genero fg3 
            JOIN Genero g3 ON fg3.ID_Genero = g3.ID_Genero 
            WHERE fg3.ID_Filme = f.ID_Filme AND g3.Nome LIKE ?
          ) OR 
          EXISTS (
            SELECT 1 FROM Filme_Produtora fp3 
            JOIN Produtora p3 ON fp3.ID_Produtora = p3.ID_Produtora 
            WHERE fp3.ID_Filme = f.ID_Filme AND p3.Nome_Produtora LIKE ?
          ) OR
          YEAR(f.Data_Lancamento) LIKE ?
        GROUP BY f.ID_Filme, f.Titulo, f.Data_Lancamento, f.Duracao, f.Sinopse, f.Url_Poster
        HAVING search_score > 0
        ORDER BY search_score DESC, vote_average DESC, f.Data_Lancamento DESC
        LIMIT 20
      `;

      const exactTitle = query;           // Busca exata no título
      const partialTitle = `%${query}%`;  // Busca parcial no título
      const searchTerm = `%${query}%`;    // Busca geral
      const yearTerm = `%${query}%`;      // Busca por ano
      
      const movies = await this.db.query(searchQuery, [
        exactTitle, partialTitle, searchTerm, searchTerm, yearTerm,  // Para scoring
        searchTerm, searchTerm, searchTerm, yearTerm,                // Para match_type
        searchTerm, searchTerm, searchTerm, yearTerm                 // Para WHERE
      ]);
      
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        runtime: movie.runtime,
        overview: movie.overview,
        poster_path: movie.poster_path,
        vote_average: parseFloat(movie.vote_average),
        vote_count: movie.vote_count,
        genre: movie.genres ? movie.genres.split(', ')[0] : null,
        genres: movie.genres ? movie.genres.split(', ').map((name, index) => ({ id: index + 1, name })) : [],
        production_companies: movie.production_companies ? movie.production_companies.split(', ').map((name, index) => ({ id: index + 1, name })) : [],
        search_score: movie.search_score,
        match_type: movie.match_type
      }));

    } catch (error) {
      console.error('Erro na busca de filmes:', error);
      throw error;
    }
  }

  /**
   * Busca detalhes de um filme específico
   */
  async getMovieById(movieId) {
    try {
      const query = `
        SELECT 
          f.ID_Filme as id,
          f.Titulo as title,
          f.Data_Lancamento as release_date,
          f.Duracao as runtime,
          f.Sinopse as overview,
          f.Url_Poster as poster_path,
          f.Url_Poster as backdrop_path,
          GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as genres,
          GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as production_companies,
          COALESCE(AVG(a.Nota), 0) as vote_average,
          COUNT(a.ID_Avaliacao) as vote_count
        FROM Filme f
        LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
        LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
        LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
        LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
        LEFT JOIN Avalia a ON f.ID_Filme = a.ID_Filme
        WHERE f.ID_Filme = ?
        GROUP BY f.ID_Filme, f.Titulo, f.Data_Lancamento, f.Duracao, f.Sinopse, f.Url_Poster
      `;

      const movies = await this.db.query(query, [movieId]);
      
      if (movies.length === 0) {
        return null;
      }

      const movie = movies[0];
      
      return {
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        runtime: movie.runtime,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: parseFloat(movie.vote_average),
        vote_count: movie.vote_count,
        genre: movie.genres ? movie.genres.split(', ')[0] : null,
        genres: movie.genres ? movie.genres.split(', ').map((name, index) => ({ id: index + 1, name })) : [],
        production_companies: movie.production_companies ? movie.production_companies.split(', ').map((name, index) => ({ id: index + 1, name })) : []
      };

    } catch (error) {
      console.error('Erro ao buscar filme por ID:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do banco
   */
  async getStats() {
    try {
      const stats = await this.db.query(`
        SELECT 
          (SELECT COUNT(*) FROM Filme) as total_movies,
          (SELECT COUNT(*) FROM Usuario) as total_users,
          (SELECT COUNT(*) FROM Avalia) as total_ratings,
          (SELECT COUNT(*) FROM Ator) as total_actors
      `);
      
      return stats[0];
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca filmes especificamente por gênero
   */
  async searchMoviesByGenre(genre) {
    try {
      const query = `
        SELECT 
          f.ID_Filme as id,
          f.Titulo as title,
          f.Data_Lancamento as release_date,
          f.Duracao as runtime,
          f.Sinopse as overview,
          f.Url_Poster as poster_path,
          GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as genres,
          GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as production_companies,
          COALESCE(AVG(a.Nota), 0) as vote_average,
          COUNT(a.ID_Avaliacao) as vote_count
        FROM Filme f
        LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
        LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
        LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
        LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
        LEFT JOIN Avalia a ON f.ID_Filme = a.ID_Filme
        WHERE g.Nome LIKE ?
        GROUP BY f.ID_Filme, f.Titulo, f.Data_Lancamento, f.Duracao, f.Sinopse, f.Url_Poster
        ORDER BY vote_average DESC, f.Data_Lancamento DESC
        LIMIT 20
      `;

      const genreTerm = `%${genre}%`;
      const movies = await this.db.query(query, [genreTerm]);
      
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        runtime: movie.runtime,
        overview: movie.overview,
        poster_path: movie.poster_path,
        vote_average: parseFloat(movie.vote_average),
        vote_count: movie.vote_count,
        genre: movie.genres ? movie.genres.split(', ')[0] : null,
        genres: movie.genres ? movie.genres.split(', ').map((name, index) => ({ id: index + 1, name })) : [],
        production_companies: movie.production_companies ? movie.production_companies.split(', ').map((name, index) => ({ id: index + 1, name })) : []
      }));

    } catch (error) {
      console.error('Erro na busca por gênero:', error);
      throw error;
    }
  }

  /**
   * Busca filmes especificamente por título
   */
  async searchMoviesByTitle(title) {
    try {
      const query = `
        SELECT 
          f.ID_Filme as id,
          f.Titulo as title,
          f.Data_Lancamento as release_date,
          f.Duracao as runtime,
          f.Sinopse as overview,
          f.Url_Poster as poster_path,
          GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as genres,
          GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as production_companies,
          COALESCE(AVG(a.Nota), 0) as vote_average,
          COUNT(a.ID_Avaliacao) as vote_count
        FROM Filme f
        LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
        LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
        LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
        LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
        LEFT JOIN Avalia a ON f.ID_Filme = a.ID_Filme
        WHERE f.Titulo LIKE ?
        GROUP BY f.ID_Filme, f.Titulo, f.Data_Lancamento, f.Duracao, f.Sinopse, f.Url_Poster
        ORDER BY 
          CASE WHEN f.Titulo = ? THEN 1 ELSE 0 END DESC,
          vote_average DESC, 
          f.Data_Lancamento DESC
        LIMIT 20
      `;

      const titleTerm = `%${title}%`;
      const exactTitle = title;
      const movies = await this.db.query(query, [titleTerm, exactTitle]);
      
      return movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        runtime: movie.runtime,
        overview: movie.overview,
        poster_path: movie.poster_path,
        vote_average: parseFloat(movie.vote_average),
        vote_count: movie.vote_count,
        genre: movie.genres ? movie.genres.split(', ')[0] : null,
        genres: movie.genres ? movie.genres.split(', ').map((name, index) => ({ id: index + 1, name })) : [],
        production_companies: movie.production_companies ? movie.production_companies.split(', ').map((name, index) => ({ id: index + 1, name })) : []
      }));

    } catch (error) {
      console.error('Erro na busca por título:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os gêneros disponíveis no banco
   */
  async getAllGenres() {
    try {
      // Verifica se o cache é válido
      if (this.isGenresCacheValid()) {
        return this.genresCache;
      }

      const query = `
        SELECT DISTINCT 
          g.ID_Genero as id,
          g.Nome as name,
          COUNT(DISTINCT fg.ID_Filme) as movie_count
        FROM Genero g
        LEFT JOIN Filme_Genero fg ON g.ID_Genero = fg.ID_Genero
        GROUP BY g.ID_Genero, g.Nome
        ORDER BY g.Nome ASC
      `;

      const genres = await this.db.query(query);
      
      const processedGenres = genres.map(genre => ({
        id: genre.id,
        name: genre.name,
        movie_count: genre.movie_count
      }));

      // Atualiza o cache
      this.genresCache = processedGenres;
      this.genresCacheTimestamp = Date.now();

      return processedGenres;

    } catch (error) {
      console.error('Erro ao buscar gêneros:', error);
      throw error;
    }
  }

  /**
   * Verifica se o cache de gêneros é válido
   */
  isGenresCacheValid() {
    if (!this.genresCache || !this.genresCacheTimestamp) {
      return false;
    }
    return Date.now() - this.genresCacheTimestamp < this.genresCacheTimeout;
  }

  /**
   * Limpa o cache de gêneros
   */
  clearGenresCache() {
    this.genresCache = null;
    this.genresCacheTimestamp = 0;
  }

  /**
   * Obtém lista de nomes de gêneros para detecção automática
   */
  async getGenreNamesForDetection() {
    try {
      const genres = await this.getAllGenres();
      return genres.map(genre => genre.name.toLowerCase());
    } catch (error) {
      console.error('Erro ao obter nomes de gêneros:', error);
      // Fallback para lista básica se houver erro
      return [
        'ação', 'action', 'aventura', 'adventure', 'comédia', 'comedy', 
        'drama', 'terror', 'horror', 'ficção científica', 'sci-fi', 'sci fi',
        'romance', 'thriller', 'suspense', 'documentário', 'documentary',
        'animação', 'animation', 'fantasia', 'fantasy', 'crime', 'mystery',
        'guerra', 'war', 'western', 'musical', 'biografia', 'biography'
      ];
    }
  }

  /**
   * Cadastra um novo usuário
   */
  async registerUser(userData) {
    try {
      const { name, email, password } = userData;

      // Verificar se o email já existe
      const existingUserQuery = 'SELECT Apelido FROM Usuario WHERE Email = ?';
      const existingUsers = await this.db.query(existingUserQuery, [email]);
      
      if (existingUsers.length > 0) {
        throw new Error('Este email já está cadastrado');
      }

      // Gerar apelido único baseado no nome
      const baseApelido = name.toLowerCase().replace(/\s+/g, '');
      let apelido = baseApelido;
      let counter = 1;

      // Verificar se o apelido já existe
      while (true) {
        const apelidoQuery = 'SELECT Apelido FROM Usuario WHERE Apelido = ?';
        const existingApelidos = await this.db.query(apelidoQuery, [apelido]);
        
        if (existingApelidos.length === 0) {
          break;
        }
        apelido = `${baseApelido}${counter}`;
        counter++;
      }

      // Inserir novo usuário
      const insertQuery = `
        INSERT INTO Usuario (Apelido, Nome, Email, Senha)
        VALUES (?, ?, ?, ?)
      `;

      // Hash simples da senha (em produção, use bcrypt)
      const hashedPassword = Buffer.from(password).toString('base64');
      
      await this.db.query(insertQuery, [apelido, name, email, hashedPassword]);

      // Retornar dados do usuário criado (sem senha)
      return {
        id: apelido,
        name,
        email,
        apelido
      };

    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca o elenco de um filme (atores e papéis)
   * @param {number} movieId - ID do filme
   * @returns {Promise<Array>} Lista de atores e papéis
   */
  async getMovieCast(movieId) {
    try {
      const query = `
        SELECT 
          a.ID_Ator as id_ator,
          a.Nome as nome_ator,
          at.ID_Papel as id_papel
        FROM Atua at
        JOIN Ator a ON at.ID_Ator = a.ID_Ator
        WHERE at.ID_Filme = ?
      `;
      const cast = await this.db.query(query, [movieId]);
      return cast;
    } catch (error) {
      console.error('Erro ao buscar elenco do filme:', error);
      throw error;
    }
  }

  /**
   * Busca avaliações de um filme
   * @param {number} movieId - ID do filme
   * @returns {Promise<Array>} Lista de avaliações
   */
  async getMovieReviews(movieId) {
    try {
      const query = `
        SELECT 
          u.Nome as usuario,
          a.Nota as nota,
          a.Review as comentario
        FROM Avalia a
        JOIN Usuario u ON a.Apelido = u.Apelido
        WHERE a.ID_Filme = ?
        ORDER BY a.Data_Avaliacao DESC
      `;
      const reviews = await this.db.query(query, [movieId]);
      return reviews;
    } catch (error) {
      console.error('Erro ao buscar avaliações do filme:', error);
      throw error;
    }
  }

  /**
   * Autentica um usuário pelo email e senha
   * @param {Object} param0 - Dados de login
   * @returns {Promise<Object|null>} Usuário autenticado ou null
   */
  async loginUser({ email, password }) {
    // Hash simples igual ao do cadastro
    const hashedPassword = Buffer.from(password).toString('base64');
    const query = `
      SELECT Apelido as id, Nome as name, Email as email
      FROM Usuario
      WHERE Email = ? AND Senha = ?
      LIMIT 1
    `;
    const users = await this.db.query(query, [email, hashedPassword]);
    return users[0] || null;
  }

  /**
   * Busca avaliações de um usuário
   * @param {string} apelido - Apelido do usuário
   * @returns {Promise<Array>} Lista de avaliações
   */
  async getUserReviews(apelido) {
    try {
      const query = `
        SELECT 
          a.ID_Filme as movieId,
          f.Titulo as movieTitle,
          f.Url_Poster as moviePoster,
          a.Nota as rating,
          a.Review as comment,
          a.Data_Avaliacao as date
        FROM Avalia a
        JOIN Filme f ON a.ID_Filme = f.ID_Filme
        WHERE a.Apelido = ?
        ORDER BY a.Data_Avaliacao DESC
      `;
      const reviews = await this.db.query(query, [apelido]);
      return reviews;
    } catch (error) {
      console.error('Erro ao buscar avaliações do usuário:', error);
      throw error;
    }
  }

  async addMovieReview(movieId, apelido, nota, comentario) {
    console.log('addMovieReview params:', { movieId, apelido, nota, comentario });
    const query = `
      INSERT INTO Avalia (ID_Avaliacao, Nota, Review, Data_Avaliacao, ID_Filme, Apelido)
      VALUES (UNIX_TIMESTAMP(NOW()), ?, ?, CURDATE(), ?, ?)
    `;
    await this.db.query(query, [nota, comentario, movieId, apelido]);
  }
}

export default DatabaseService;