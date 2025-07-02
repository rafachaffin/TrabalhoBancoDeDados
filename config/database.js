/**
 * Configuração do Banco de Dados
 * Configurações centralizadas para conexão com MySQL
 */

import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host:  'localhost',
  user:  'root',
  password:  '',
  database:  'cineboxd_db',
  port:  3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci'
};

export const dbTables = {
  USERS: 'Usuario',
  MOVIES: 'Filme',
  REVIEWS: 'Avalia',
  ACTORS: 'Ator',
  STUDIOS: 'Produtora',
  GENRES: 'Genero',
  ACTING: 'Atua',
  MOVIE_GENRES: 'Filme_Genero',
  MOVIE_STUDIOS: 'Filme_Produtora'
};

export const dbQueries = {
  // Queries de usuário
  GET_USER_BY_APELIDO: 'SELECT * FROM Usuario WHERE Apelido = ?',
  GET_USER_BY_EMAIL: 'SELECT * FROM Usuario WHERE Email = ?',
  CREATE_USER: 'INSERT INTO Usuario (Apelido, Nome, Email, Senha) VALUES (?, ?, ?, ?)',
  // Queries de filme
  GET_ALL_MOVIES: `
    SELECT 
      f.ID_Filme,
      f.Titulo,
      f.Data_Lancamento,
      f.Duracao,
      f.Custo,
      f.Sinopse,
      f.Url_Poster,
      f.Media_Avaliacoes,
      GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as Generos,
      GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as Produtoras
    FROM Filme f
    LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
    LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
    LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
    LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
    GROUP BY f.ID_Filme
    ORDER BY f.Custo DESC
  `,
  GET_MOVIE_BY_ID: `
    SELECT 
      f.ID_Filme,
      f.Titulo,
      f.Data_Lancamento,
      f.Duracao,
      f.Custo,
      f.Sinopse, 
      f.Url_Poster,
      f.Media_Avaliacoes,
      GROUP_CONCAT(DISTINCT g.Nome SEPARATOR ', ') as Generos,
      GROUP_CONCAT(DISTINCT p.Nome_Produtora SEPARATOR ', ') as Produtoras
    FROM Filme f
    LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
    LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
    LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
    LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
    WHERE f.ID_Filme = ?
    GROUP BY f.ID_Filme
  `,
  
  // Queries de avaliação
  GET_MOVIE_REVIEWS: `
    SELECT 
      av.ID_Avaliacao,
      av.Nota,
      av.Review,
      av.Data_Avaliacao,
      u.Apelido,
      u.Nome
    FROM Avalia av
    JOIN Usuario u ON av.Apelido = u.Apelido
    WHERE av.ID_Filme = ?
    ORDER BY av.Data_Avaliacao DESC
  `,
  GET_USER_REVIEWS: `
    SELECT 
      av.ID_Avaliacao,
      av.Nota,
      av.Review,
      av.Data_Avaliacao,
      f.ID_Filme,
      f.Titulo
    FROM Avalia av
    JOIN Filme f ON av.ID_Filme = f.ID_Filme
    WHERE av.Apelido = ?
    ORDER BY av.Data_Avaliacao DESC
  `,
  ADD_REVIEW: 'INSERT INTO Avalia (ID_Avaliacao, Nota, Review, Data_Avaliacao, ID_Filme, Apelido) VALUES (?, ?, ?, NOW(), ?, ?)',
 
  DELETE_REVIEW: 'DELETE FROM Avalia WHERE ID_Filme = ? AND Apelido = ? AND ID_Avaliacao = ?',
  
  // Queries de estatísticas
  GET_STATS: `
    SELECT 
      (SELECT COUNT(*) FROM Filme) as total_movies,
      (SELECT COUNT(*) FROM Usuario) as total_users,
      (SELECT COUNT(*) FROM Avalia) as total_reviews,
      (SELECT AVG(Nota) FROM Avalia) as average_rating
  `,
  GET_MOVIE_CAST: `
    SELECT 
      a.ID_Ator,
      a.Nome,
      at.ID_Papel
    FROM Atua at
    JOIN Ator a ON at.ID_Ator = a.ID_Ator
    WHERE at.ID_Filme = ?
    ORDER BY at.ID_Papel
  `,
  SEARCH_MOVIES: `
    SELECT DISTINCT
      f.ID_Filme,
      f.Titulo,
      f.Data_Lancamento,
      f.Duracao,
      f.Custo,
      f.Sinopse,
      f.Url_Poster,
      f.Media_Avaliacoes
    FROM Filme f
    LEFT JOIN Filme_Genero fg ON f.ID_Filme = fg.ID_Filme
    LEFT JOIN Genero g ON fg.ID_Genero = g.ID_Genero
    LEFT JOIN Filme_Produtora fp ON f.ID_Filme = fp.ID_Filme
    LEFT JOIN Produtora p ON fp.ID_Produtora = p.ID_Produtora
    WHERE 
      f.Titulo LIKE ? OR
      g.Nome LIKE ? OR
      p.Nome_Produtora LIKE ? OR
      f.Sinopse LIKE ? OR
      f.ID_Filme = ?
    ORDER BY f.Media_Avaliacoes DESC
  `,
  ADD_MOVIE_REVIEW: `
    INSERT INTO Avalia (ID_Filme, Apelido, Nota, Review, Data_Avaliacao)
    VALUES (?, ?, ?, ?, NOW())
  `,
  GET_USER_MOVIE_REVIEW: `
    SELECT 
      ID_Avaliacao,
      Nota,
      Review,
      Data_Avaliacao
    FROM Avalia
    WHERE ID_Filme = ? AND Apelido = ?
  `,
  DELETE_MOVIE_REVIEW: `
    DELETE FROM Avalia
    WHERE ID_Filme = ? AND Apelido = ?
  `
};

export default {
  dbConfig,
  dbTables,
  dbQueries
}; 