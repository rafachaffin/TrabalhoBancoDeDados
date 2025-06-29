# 🚀 Guia de Configuração - Cineboxd

Este guia irá ajudá-lo a configurar o Cineboxd com o schema integrado que combina seu schema original com funcionalidades avançadas.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **MySQL** (versão 8.0 ou superior)
- **npm** ou **yarn**

### Verificando as Instalações

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar MySQL
mysql --version
```

## 🗄️ Configuração do Banco de Dados

### 1. Criar o Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Criar o banco de dados
CREATE DATABASE cineboxd_db;
USE cineboxd_db;

# Sair do MySQL
EXIT;
```

### 2. Executar o Schema Integrado

O schema integrado combina suas tabelas originais com funcionalidades extras:

```bash
# Executar o schema principal
mysql -u root -p cineboxd_db < database/schema.sql
```

**O que o schema inclui:**

#### Tabelas Originais (Mantidas)
- `Produtora` - Informações das produtoras
- `Genero` - Gêneros cinematográficos  
- `Filme` - Dados dos filmes
- `Ator` - Informações dos atores
- `Usuario` - Usuários do sistema
- `Avalia` - Avaliações dos usuários
- `Atua` - Relacionamento atores-filmes

#### Funcionalidades Extras (Adicionadas)
- `Categoria` - Categorias de organização
- `Filme_Categoria` - Relacionamento filmes-categorias
- `Favorito` - Favoritos dos usuários
- `Log_Acesso` - Logs de acesso
- `Cache` - Sistema de cache

### 3. Popular com Dados de Exemplo (Opcional)

```bash
# Executar dados de exemplo
mysql -u root -p cineboxd_db < database/sample_data.sql
```

**Dados incluídos:**
- 15 filmes de diferentes categorias
- 22 atores com informações completas
- 5 usuários de exemplo
- 20 avaliações com reviews
- 14 favoritos distribuídos
- Categorização completa

## ⚙️ Configuração da Aplicação

### 1. Instalar Dependências

```bash
# Navegar para o diretório do projeto
cd "banco de dados"

# Instalar dependências
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env
```

Editar o arquivo `.env`:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=cineboxd_db

# API Externa (TMDB) - Opcional
TMDB_API_KEY=sua_chave_api_tmdb

# Configurações da Aplicação
PORT=3000
NODE_ENV=development
```

### 3. Verificar a Conexão

```bash
# Testar conexão com o banco
npm run test:db
```

## 🚀 Executando a Aplicação

### Modo de Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

### Verificar se Está Funcionando

1. **Acesse** `http://localhost:3000`
2. **Verifique** se a página carrega corretamente
3. **Teste** a busca de filmes
4. **Clique** em um filme para ver os detalhes

## 🔍 Verificando o Banco de Dados

### Conectar ao MySQL

```bash
mysql -u root -p cineboxd_db
```

### Consultas de Verificação

```sql
-- Verificar tabelas criadas
SHOW TABLES;

-- Verificar filmes inseridos
SELECT Titulo, Data_Lancamento, Nome_Genero 
FROM Filme f 
JOIN Genero g ON f.ID_Genero = g.ID_Genero 
LIMIT 5;

-- Verificar categorias
SELECT * FROM Categoria;

-- Verificar usuários
SELECT Apelido, Nome, Email FROM Usuario;

-- Verificar avaliações
SELECT f.Titulo, a.Nota, a.Review, u.Apelido
FROM Avalia a
JOIN Filme f ON a.ID_Filme = f.ID_Filme
JOIN Usuario u ON a.Apelido = u.Apelido
LIMIT 5;
```

## 🛠️ Solução de Problemas

### Erro de Conexão com MySQL

```bash
# Verificar se o MySQL está rodando
sudo systemctl status mysql

# Iniciar MySQL se necessário
sudo systemctl start mysql
```

### Erro de Permissão

```bash
# Dar permissões ao usuário
mysql -u root -p
GRANT ALL PRIVILEGES ON cineboxd_db.* TO 'seu_usuario'@'localhost';
FLUSH PRIVILEGES;
```

### Erro de Porta em Uso

```bash
# Verificar processos na porta 3000
lsof -i :3000

# Matar processo se necessário
kill -9 PID_DO_PROCESSO
```

### Erro de Módulos

```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📊 Estrutura do Schema Integrado

### Relacionamentos Principais

```
Filme (1:N) Avalia
Filme (N:N) Categoria (via Filme_Categoria)
Filme (N:N) Ator (via Atua)
Usuario (1:N) Avalia
Usuario (1:N) Favorito
```

### Views Úteis

```sql
-- Detalhes completos dos filmes
SELECT * FROM Detalhes_Filme;

-- Filmes por categoria
SELECT * FROM Filmes_Por_Categoria;
```

### Procedures Disponíveis

```sql
-- Limpar cache expirado
CALL LimparCacheExpirado();

-- Calcular nota média de um filme
SELECT CalcularNotaMedia(1);
```

## 🔄 Atualizações

### Atualizar Schema

```bash
# Fazer backup do banco atual
mysqldump -u root -p cineboxd_db > backup_$(date +%Y%m%d).sql

# Executar novo schema
mysql -u root -p cineboxd_db < database/schema.sql
```

### Atualizar Dados

```bash
# Executar novos dados de exemplo
mysql -u root -p cineboxd_db < database/sample_data.sql
```

## 📝 Logs e Monitoramento

### Verificar Logs da Aplicação

```bash
# Logs em tempo real
tail -f logs/app.log

# Logs de erro
tail -f logs/error.log
```

### Monitorar Banco de Dados

```sql
-- Verificar conexões ativas
SHOW PROCESSLIST;

-- Verificar status das tabelas
SHOW TABLE STATUS;

-- Verificar tamanho do banco
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'cineboxd_db'
GROUP BY table_schema;
```

## 🎯 Próximos Passos

Após a configuração bem-sucedida:

1. **Explore** as funcionalidades da aplicação
2. **Teste** o sistema de busca e filtros
3. **Experimente** as avaliações e favoritos
4. **Personalize** o design conforme necessário
5. **Adicione** novos filmes ao banco de dados

## 📞 Suporte

Se encontrar problemas:

1. **Verifique** os logs de erro
2. **Consulte** a documentação do README.md
3. **Abra** uma issue no repositório
4. **Entre em contato** com a equipe de desenvolvimento

---

**🎬 Divirta-se explorando o Cineboxd!** 