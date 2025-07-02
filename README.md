# CineBoxd 🎬

Um catálogo moderno e responsivo de filmes com funcionalidades avançadas de busca, avaliações e interface otimizada.

## ✨ Características

- **Interface Moderna**: Design responsivo com glassmorphism e animações suaves
- **Busca Inteligente**: Sistema de busca com detecção automática de tipo (título, gênero, ano)
- **Sistema de Avaliações**: Usuários podem avaliar filmes com notas e comentários
- **Performance Otimizada**: 
  - React.memo para componentes
  - Hooks customizados para gerenciamento de estado
  - Context API para autenticação
  - Lazy loading de imagens
- **Backend Robusto**:
  - Rotas organizadas e modulares
  - Middleware de validação e tratamento de erros
  - Rate limiting para segurança
  - Cache inteligente para gêneros

## 🚀 Tecnologias

### Frontend
- **React 18** com hooks modernos
- **Vite** para build rápido
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Lucide React** para ícones
- **Context API** para gerenciamento de estado

### Backend
- **Node.js** com Express
- **MySQL** para banco de dados
- **Helmet** para segurança
- **Morgan** para logging
- **Compression** para otimização
- **Rate Limiting** para proteção

## 📦 Instalação

### Pré-requisitos

#### Com Docker (Recomendado)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/) (já incluso no Docker Desktop)

#### Sem Docker (Manual)
- [Node.js](https://nodejs.org/) (18+ recomendado)
- [npm](https://www.npmjs.com/)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (8+)

### Instalação com Docker (Recomendado)

1. **Clone o repositório:**
   ```sh
   git clone <URL_DO_REPOSITORIO>
   cd TrabalhoBancoDeDados
   ```

2. **Suba os containers:**
   ```sh
   docker-compose up --build
   ```
   - Isso irá instalar dependências, subir o banco MySQL populado, backend e frontend.

3. **Acesse o sistema:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:3001](http://localhost:3001)

4. **Parar os containers:**
   ```sh
   docker-compose down
   ```

### Instalação Manual (Sem Docker)

#### Banco de Dados

1. Instale o MySQL e crie o banco:
   ```sql
   CREATE DATABASE cineboxd;
   CREATE USER 'cineuser'@'%' IDENTIFIED BY 'cinepass';
   GRANT ALL PRIVILEGES ON cineboxd.* TO 'cineuser'@'%';
   FLUSH PRIVILEGES;
   ```
2. Importe os scripts SQL da pasta `Dump20250629`:
   ```sh
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_ator.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_atua.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_avalia.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_filme.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_filme_genero.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_filme_produtora.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_genero.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_produtora.sql
   mysql -u cineuser -p cineboxd < Dump20250629/cineboxd_db_usuario.sql
   ```

#### Backend

1. Entre na pasta do backend:
   ```sh
   cd backend
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Configure a conexão com o banco em `database/connection.js` (ou via variáveis de ambiente):
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
4. Inicie o backend:
   ```sh
   node ../server.js
   ```
   - (ou `npm start` se houver script no `package.json`)

#### Frontend

1. Volte para a raiz do projeto e entre na pasta do frontend:
   ```sh
   cd ../src
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Inicie o frontend:
   ```sh
   npm run dev
   ```
   - O frontend estará disponível em [http://localhost:5173](http://localhost:5173)

## 🏗️ Estrutura do Projeto

```
cineboxd/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── contexts/           # Contextos React (Auth)
│   ├── hooks/              # Hooks customizados
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de API
│   └── App.jsx            # Componente principal
├── backend/
│   ├── middleware/         # Middlewares Express
│   ├── routes/            # Rotas da API
│   └── services/          # Serviços de banco
├── database/              # Configuração do banco
└── server.js             # Servidor Express
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia desenvolvimento (frontend + backend)
- `npm run server` - Inicia apenas o servidor
- `npm run client` - Inicia apenas o frontend
- `npm run build` - Build para produção
- `npm run lint` - Executa ESLint
- `npm run lint:fix` - Corrige problemas do ESLint
- `npm run format` - Formata código com Prettier

## 🎯 Otimizações Implementadas

### Frontend
- **Context API**: Gerenciamento centralizado de autenticação e avaliações
- **Hooks Customizados**: `useMovies`, `useMovie` para lógica reutilizável
- **React.memo**: Otimização de re-renderizações
- **Error Boundary**: Captura de erros de renderização
- **Loading States**: Componentes de loading reutilizáveis
- **Lazy Loading**: Carregamento otimizado de imagens

### Backend
- **Rotas Modulares**: Separação de responsabilidades
- **Middleware de Validação**: Validação de dados de entrada
- **Tratamento de Erros**: Sistema centralizado de erros
- **Rate Limiting**: Proteção contra spam
- **Cache Inteligente**: Cache de gêneros com TTL
- **Queries Otimizadas**: Busca com scoring e índices

### Performance
- **Compressão**: Gzip para respostas HTTP
- **Helmet**: Headers de segurança
- **Morgan**: Logging otimizado
- **CORS**: Configuração específica por ambiente

## 🔒 Segurança

- **Helmet**: Headers de segurança HTTP
- **Rate Limiting**: Proteção contra ataques DDoS
- **Validação**: Sanitização de dados de entrada
- **CORS**: Configuração restritiva
- **Error Handling**: Não exposição de informações sensíveis

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints otimizados:
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

## 🧪 Testes

```bash
# Executar linting
npm run lint

# Verificar formatação
npm run format
```

## 📈 Monitoramento

- **Health Check**: `/health` - Status do servidor e banco
- **API Info**: `/api/info` - Informações da API
- **Logs**: Morgan para requisições HTTP

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Rafa Chaffin**
- GitHub: [@rafachaffin](https://github.com/rafachaffin)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
