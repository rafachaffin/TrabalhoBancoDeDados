/**
 * DatabaseModel
 * Modelo base para conexão com banco de dados MySQL
 * Responsável por gerenciar conexões e operações básicas
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseModel {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa a conexão com o banco de dados
   */
  async initialize() {
    if (this.isInitialized) {
      return this.pool;
    }

    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cineboxd_db',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      });

      // Testa a conexão
      await this.pool.getConnection();
      this.isInitialized = true;
      
      console.log('✅ Conexão com banco de dados estabelecida');
      return this.pool;
    } catch (error) {
      console.error('❌ Erro ao conectar com banco de dados:', error);
      throw new Error('Falha na conexão com banco de dados');
    }
  }

  /**
   * Executa uma query SQL
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Array>} Resultado da query
   */
  async query(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('❌ Erro na query:', error);
      throw new Error(`Erro na execução da query: ${error.message}`);
    }
  }

  /**
   * Executa uma query de inserção
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Object>} Resultado da inserção
   */
  async insert(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [result] = await this.pool.execute(sql, params);
      return {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('❌ Erro na inserção:', error);
      throw new Error(`Erro na inserção: ${error.message}`);
    }
  }

  /**
   * Executa uma query de atualização
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Object>} Resultado da atualização
   */
  async update(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [result] = await this.pool.execute(sql, params);
      return {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      };
    } catch (error) {
      console.error('❌ Erro na atualização:', error);
      throw new Error(`Erro na atualização: ${error.message}`);
    }
  }

  /**
   * Executa uma query de exclusão
   * @param {string} sql - Query SQL
   * @param {Array} params - Parâmetros da query
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async delete(sql, params = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [result] = await this.pool.execute(sql, params);
      return {
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('❌ Erro na exclusão:', error);
      throw new Error(`Erro na exclusão: ${error.message}`);
    }
  }

  /**
   * Inicia uma transação
   * @returns {Promise<Object>} Conexão da transação
   */
  async beginTransaction() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const connection = await this.pool.getConnection();
      await connection.beginTransaction();
      return connection;
    } catch (error) {
      console.error('❌ Erro ao iniciar transação:', error);
      throw new Error(`Erro ao iniciar transação: ${error.message}`);
    }
  }

  /**
   * Confirma uma transação
   * @param {Object} connection - Conexão da transação
   */
  async commitTransaction(connection) {
    try {
      await connection.commit();
      connection.release();
    } catch (error) {
      console.error('❌ Erro ao confirmar transação:', error);
      throw new Error(`Erro ao confirmar transação: ${error.message}`);
    }
  }

  /**
   * Reverte uma transação
   * @param {Object} connection - Conexão da transação
   */
  async rollbackTransaction(connection) {
    try {
      await connection.rollback();
      connection.release();
    } catch (error) {
      console.error('❌ Erro ao reverter transação:', error);
      throw new Error(`Erro ao reverter transação: ${error.message}`);
    }
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      console.log('🔌 Conexão com banco de dados fechada');
    }
  }

  /**
   * Obtém estatísticas do banco de dados
   * @returns {Promise<Object>} Estatísticas
   */
  async getStats() {
    try {
      const stats = {};
      
      // Contagem de filmes
      const [movieCount] = await this.query('SELECT COUNT(*) as count FROM filme');
      stats.totalMovies = movieCount.count;
      
      // Contagem de usuários
      const [userCount] = await this.query('SELECT COUNT(*) as count FROM usuario');
      stats.totalUsers = userCount.count;
      
      // Contagem de avaliações
      const [reviewCount] = await this.query('SELECT COUNT(*) as count FROM avalia');
      stats.totalReviews = reviewCount.count;
      
      // Média de avaliações
      const [avgRating] = await this.query('SELECT AVG(nota) as average FROM avalia');
      stats.averageRating = parseFloat(avgRating.average || 0).toFixed(2);
      
      return stats;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      throw new Error('Erro ao obter estatísticas do banco de dados');
    }
  }
}

// Exporta instância singleton
export const databaseModel = new DatabaseModel();
export default DatabaseModel; 