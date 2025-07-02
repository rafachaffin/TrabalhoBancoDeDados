-- Tabela de produtoras
CREATE TABLE Produtora (
  ID_Produtora INT PRIMARY KEY,
  Nome_Produtora VARCHAR(100) NOT NULL,
  Nacionalidade_Produtora VARCHAR(50) NOT NULL
);



-- Tabela de gêneros
CREATE TABLE Genero (
  ID_Genero INT PRIMARY KEY,
  Nome VARCHAR(50) NOT NULL
);

-- Tabela de filmes
CREATE TABLE Filme (
  ID_Filme INT PRIMARY KEY,
  Titulo VARCHAR(100) NOT NULL,
  Data_Lancamento DATE NOT NULL,
  Duracao INT NOT NULL,
  Custo DOUBLE NOT NULL,
  Sinopse VARCHAR(1000) NOT NULL,
  Url_Poster VARCHAR(255),
  Media_Avaliacoes DECIMAL(4,2) DEFAULT 0.00,
  FOREIGN KEY (ID_Produtora) REFERENCES Produtora(ID_Produtora) 
    ON UPDATE CASCADE ON DELETE CASCADE
);



CREATE TABLE Filme_Produtora (
  ID_Filme INT,
  ID_Produtora INT,
  PRIMARY KEY (ID_Filme, ID_Produtora),
  FOREIGN KEY (ID_Filme) REFERENCES Filme(ID_Filme) 
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (ID_Produtora) REFERENCES Produtora(ID_Produtora) 
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabela associativa: Filme x Genero (relação N:N)
CREATE TABLE Filme_Genero (
  ID_Filme INT,
  ID_Genero INT,
  PRIMARY KEY (ID_Filme, ID_Genero),
  FOREIGN KEY (ID_Filme) REFERENCES Filme(ID_Filme) 
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (ID_Genero) REFERENCES Genero(ID_Genero) 
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabela de atores
CREATE TABLE Ator (
  ID_Ator INT PRIMARY KEY,
  Nome VARCHAR(100) NOT NULL,
  Sexo VARCHAR(30) NOT NULL,
  Data_Nasc DATE NOT NULL,
  Nacionalidade VARCHAR(50) NOT NULL
);

-- Tabela de usuários
CREATE TABLE Usuario (
  Apelido VARCHAR(30) PRIMARY KEY,
  Nome VARCHAR(100) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Senha VARCHAR(20) NOT NULL
);

-- Tabela de avaliações
CREATE TABLE Avalia (
  ID_Avaliacao INT,
  Nota DECIMAL(2,1) NOT NULL CHECK (Nota IN (0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)),
  Review VARCHAR(1000),
  Data_Avaliacao DATE NOT NULL,
  ID_Filme INT NOT NULL,
  Apelido VARCHAR(30) NOT NULL,
  PRIMARY KEY (Apelido, ID_Filme, ID_Avaliacao),
  FOREIGN KEY (ID_Filme) REFERENCES Filme(ID_Filme) 
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (Apelido) REFERENCES Usuario(Apelido) 
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Tabela que relaciona atores e filmes
CREATE TABLE Atua (
  ID_Filme INT,
  ID_Ator INT,
  ID_Papel INT,
  PRIMARY KEY (ID_Filme, ID_Ator, ID_Papel),
  FOREIGN KEY (ID_Filme) REFERENCES Filme(ID_Filme) 
    ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (ID_Ator) REFERENCES Ator(ID_Ator) 
    ON UPDATE CASCADE ON DELETE CASCADE
);