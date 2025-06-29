/**
 * Database Connection
 * Configuração e conexão com o banco de dados MySQL
 */

import mysql from 'mysql2/promise';

// Configuração do banco de dados
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cineboxd_db',
  charset: 'utf8mb4',
  timezone: '+00:00',
  
  // Configurações de pool de conexões
  connectionLimit: 10,
  
  // Configurações de SSL (para produção)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
};

class DatabaseConnection {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  /**
   * Inicializa a conexão com o banco de dados
   */
  async connect() {
    try {
      this.pool = mysql.createPool(DB_CONFIG);
      
      // Testa a conexão
      const connection = await this.pool.getConnection();
      console.log('✅ Conexão com banco de dados estabelecida');
      
      connection.release();
      this.isConnected = true;
      
      return this.pool;
    } catch (error) {
      console.error('❌ Erro ao conectar com banco de dados:', error);
      throw new Error('Falha na conexão com banco de dados');
    }
  }

  /**
   * Obtém uma conexão do pool
   */
  async getConnection() {
    if (!this.pool) {
      await this.connect();
    }
    
    try {
      return await this.pool.getConnection();
    } catch (error) {
      console.error('Erro ao obter conexão:', error);
      throw error;
    }
  }

  /**
   * Executa uma query
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Array>} Resultado da query
   */
  async query(sql, params = []) {
    if (!this.pool) {
      await this.connect();
    }
    
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Erro na query:', error);
      console.error('SQL:', sql);
      console.error('Parâmetros:', params);
      throw error;
    }
  }

  /**
   * Executa uma transação
   * @param {Function} callback - Função com as operações da transação
   * @returns {Promise<any>} Resultado da transação
   */
  async transaction(callback) {
    if (!this.pool) {
      await this.connect();
    }
    
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const result = await callback(connection);
      
      await connection.commit();
      
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('🔌 Conexão com banco de dados fechada');
    }
  }

  /**
   * Verifica se a conexão está ativa
   */
  async ping() {
    if (!this.pool) {
      return false;
    }
    
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém estatísticas do pool de conexões
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }
    
    return {
      threadId: this.pool.threadId,
      connectionLimit: this.pool.config.connectionLimit,
      // Outras estatísticas podem ser adicionadas aqui
    };
  }
}

// Instância singleton
const databaseConnection = new DatabaseConnection();

// Função para inicializar a conexão
export async function initializeDatabase() {
  try {
    await databaseConnection.connect();
    return databaseConnection;
  } catch (error) {
    console.error('Falha ao inicializar banco de dados:', error);
    throw error;
  }
}

// Função para obter a instância da conexão
export function getDatabaseConnection() {
  return databaseConnection;
}

// Função para fechar a conexão (útil para testes)
export async function closeDatabase() {
  await databaseConnection.close();
}

// Exporta a instância diretamente
export default databaseConnection; 