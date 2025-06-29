/**
 * Server
 * Servidor Express otimizado com rotas separadas e middlewares
 */

import path from 'path';
import { fileURLToPath } from 'url';

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

// Importações de rotas e middlewares
import { errorHandler, notFoundHandler } from './backend/middleware/errorHandler.js';
import DatabaseService from './backend/services/database-service.js';

// Configuração do __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Inicializa o serviço de banco de dados
const dbService = new DatabaseService();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    error: 'Muitas requisições',
    message: 'Muitas requisições deste IP, tente novamente em 15 minutos'
  }
});

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.themoviedb.org"]
    }
  }
}));

// Middleware de compressão
app.use(compression());

// Middleware de CORS
app.use(cors({
  origin: isDevelopment ? ['http://localhost:5173', 'http://localhost:3000'] : true,
  credentials: true
}));

// Middleware de logging
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// Rate limiting
app.use('/api/', limiter);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do backend
app.use('/backend', express.static(path.join(__dirname, 'backend')));

// Função para inicializar o servidor
async function startServer() {
  try {
    // Inicializa o banco de dados
    await dbService.initialize();

    // Importa rotas após inicialização do banco
    const movieRoutes = (await import('./backend/routes/movies.js')).default;
    const searchRoutes = (await import('./backend/routes/search.js')).default;
    const authRoutes = (await import('./backend/routes/auth.js')).default;

    // Rotas da API com injeção de dependência
    app.use('/api/movies', movieRoutes(dbService));
    app.use('/api/search', searchRoutes(dbService));
    app.use('/api/auth', authRoutes(dbService));

    // Rota de health check
    app.get('/health', async (req, res) => {
      try {
        // Verifica conexão com banco de dados
        await dbService.initialize();
        res.json({
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: 'connected'
        });
      } catch (error) {
        res.status(503).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: 'disconnected',
          error: error.message
        });
      }
    });

    // Rota de informações da API
    app.get('/api/info', (req, res) => {
      res.json({
        name: 'Cineboxd API',
        version: '1.0.0',
        description: 'API para catálogo de filmes',
        endpoints: {
          movies: '/api/movies',
          search: '/api/search',
          health: '/health'
        }
      });
    });

    // Rota de estatísticas
    app.get('/api/stats', async (req, res) => {
      try {
        const stats = await dbService.getStats();
        res.json(stats);
      } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ 
          error: 'Erro interno do servidor',
          message: error.message 
        });
      }
    });

    // Em desenvolvimento, o Vite serve o frontend
    if (isDevelopment) {
      app.get('/', (req, res) => {
        res.redirect('http://localhost:5173');
      });
    } else {
      // Em produção, servir arquivos estáticos do React
      app.use(express.static(path.join(__dirname, 'dist')));
      
      // Fallback para SPA
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }

    // Middleware de tratamento de erros (deve ser o último)
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      if (isDevelopment) {
        console.log(`🌐 Frontend: http://localhost:5173`);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicia o servidor
startServer();