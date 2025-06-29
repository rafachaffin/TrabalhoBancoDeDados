# Melhorias na Busca de Filmes

## Visão Geral

Implementamos melhorias significativas no sistema de busca para distinguir automaticamente entre buscas por **título de filme** e **gênero**, além de adicionar um sistema de scoring para priorizar resultados mais relevantes. O sistema agora busca dinamicamente os gêneros disponíveis no banco de dados.

## Funcionalidades Implementadas

### 1. Busca Inteligente com Scoring

A busca agora utiliza um sistema de pontuação que prioriza diferentes tipos de correspondência:

- **100 pontos**: Match exato no título do filme
- **80 pontos**: Match parcial no título do filme  
- **60 pontos**: Match no gênero
- **40 pontos**: Match na produtora
- **30 pontos**: Match no ano de lançamento

### 2. Detecção Automática de Tipo de Busca

O sistema detecta automaticamente se o usuário está buscando por:
- **Gênero**: Quando o termo corresponde a gêneros disponíveis no banco
- **Título**: Para outros tipos de busca (padrão)

### 3. Gêneros Dinâmicos do Banco de Dados

- **Busca automática**: O sistema consulta o banco para obter todos os gêneros disponíveis
- **Cache inteligente**: Gêneros são cacheados por 10 minutos para performance
- **Fallback seguro**: Lista básica de gêneros como backup em caso de erro

### 4. Métodos Específicos de Busca

#### `searchMovies(query)` - Busca Geral
- Busca em todos os campos com scoring
- Prioriza títulos sobre gêneros
- Retorna informações sobre o tipo de match

#### `searchMoviesByGenre(genre)` - Busca por Gênero
- Busca específica por gênero
- Ordena por avaliação e data de lançamento

#### `searchMoviesByTitle(title)` - Busca por Título
- Busca específica por título
- Prioriza matches exatos

#### `getAllGenres()` - Lista de Gêneros
- Retorna todos os gêneros disponíveis no banco
- Inclui contagem de filmes por gênero
- Usa cache para performance

## Como Usar

### Busca Automática (Recomendado)
```javascript
// O sistema detecta automaticamente o tipo de busca
GET /api/search?q=drama
GET /api/search?q=batman
GET /api/search?q=2023
```

### Busca Específica
```javascript
// Força busca por gênero
GET /api/search?q=drama&type=genre

// Força busca por título
GET /api/search?q=batman&type=title

// Busca geral (padrão)
GET /api/search?q=batman&type=general
```

### Listar Gêneros Disponíveis
```javascript
// Obtém todos os gêneros do banco
GET /api/genres
```

## Resposta da API

### Busca
```json
{
  "query": "drama",
  "searchType": "genre",
  "results": [...],
  "total": 15,
  "matchTypes": {
    "genre": 12,
    "title": 3
  }
}
```

### Gêneros
```json
{
  "genres": [
    {
      "id": 1,
      "name": "Ação",
      "movie_count": 25
    },
    {
      "id": 2,
      "name": "Drama",
      "movie_count": 18
    }
  ],
  "total": 2
}
```

## Gêneros Dinâmicos

O sistema agora:
1. **Consulta o banco** para obter todos os gêneros disponíveis
2. **Cache por 10 minutos** para melhor performance
3. **Fallback seguro** com lista básica em caso de erro
4. **Detecção automática** baseada nos gêneros reais do banco

## Benefícios

1. **Flexibilidade Total**: Suporte a qualquer gênero cadastrado no banco
2. **Performance Otimizada**: Cache inteligente reduz consultas ao banco
3. **Manutenibilidade**: Não precisa atualizar código quando adicionar gêneros
4. **Robustez**: Fallback garante funcionamento mesmo com erros
5. **Transparência**: Informações sobre como os resultados foram encontrados

## Exemplos de Uso

### Busca por Gênero (Detecção Automática)
```
GET /api/search?q=drama
```
- Consulta gêneros do banco
- Detecta "drama" como gênero
- Retorna filmes do gênero "Drama"
- Ordena por avaliação

### Busca por Título
```
GET /api/search?q=batman
```
- Detecta como busca por título
- Prioriza filmes com "Batman" no título
- Inclui variações parciais

### Listar Gêneros Disponíveis
```
GET /api/genres
```
- Retorna todos os gêneros do banco
- Inclui contagem de filmes
- Ordenados alfabeticamente

## Cache de Gêneros

O sistema implementa cache inteligente:
- **Duração**: 10 minutos
- **Invalidação**: Automática após timeout
- **Limpeza manual**: Disponível via método `clearGenresCache()`
- **Performance**: Reduz consultas ao banco significativamente 