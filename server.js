/**
 * Server
 * Servidor Express otimizado com arquitetura MVC
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

// Importações de middlewares
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Importações de Models
import { databaseModel } from './models/DatabaseModel.js';

// Importações de Controllers
import { movieController } from './controllers/MovieController.js';
import { userController } from './controllers/UserController.js';
import { searchController } from './controllers/SearchController.js';

// Configuração do __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

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

// Função para inicializar o servidor
async function startServer() {
  try {
    // Inicializa o banco de dados
    await databaseModel.initialize();

    // Configura rotas dos Controllers
    app.use('/api/movies', movieController.getRouter());
    app.use('/api/auth', userController.getRouter());
    app.use('/api/search', searchController.getRouter());

    // Rota de health check
    app.get('/health', async (req, res) => {
      try {
        // Verifica conexão com banco de dados
        await databaseModel.initialize();
        res.json({
          status: 'OK',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: 'connected',
          architecture: 'MVC'
        });
      } catch (error) {
        res.status(503).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          database: 'disconnected',
          architecture: 'MVC',
          error: error.message
        });
      }
    });

    // Rota de informações da API
    app.get('/api/info', (req, res) => {
      res.json({
        name: 'Cineboxd API',
        version: '2.0.0',
        description: 'API para catálogo de filmes com arquitetura MVC',
        architecture: 'MVC (Model-View-Controller)',
        endpoints: {
          movies: '/api/movies',
          auth: '/api/auth',
          search: '/api/search',
          health: '/health'
        },
        models: ['MovieModel', 'UserModel', 'ReviewModel', 'DatabaseModel'],
        controllers: ['MovieController', 'UserController', 'SearchController']
      });
    });

    // Rota de estatísticas
    app.get('/api/stats', async (req, res) => {
      try {
        const stats = await databaseModel.getStats();
        res.json({
          success: true,
          data: stats,
          architecture: 'MVC'
        });
      } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({ 
          success: false,
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
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Arquitetura: MVC`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      if (isDevelopment) {
        console.log(`Frontend: http://localhost:5173`);
      }
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Inicia o servidor
startServer();