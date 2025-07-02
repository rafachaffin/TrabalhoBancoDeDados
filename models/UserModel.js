/**
 * UserModel
 * Modelo responsável pela lógica de negócio relacionada aos usuários
 * Autenticação, registro e gerenciamento de usuários
 */

import { databaseModel } from './DatabaseModel.js';
import bcrypt from 'bcrypt';

class UserModel {
  constructor() {
    this.db = databaseModel;
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.nome - Nome completo
   * @param {string} userData.apelido - Apelido único
   * @param {string} userData.email - Email
   * @param {string} userData.senha - Senha
   * @returns {Promise<Object>} Dados do usuário criado
   */
  async registerUser(userData) {
    try {
      const { nome, apelido, email, senha } = userData;
      if (!nome || !apelido || !email || !senha) {
        throw new Error('Todos os campos são obrigatórios');
      }
     
      const senhaBase64 = Buffer.from(senha).toString('base64');
      const sql = `INSERT INTO Usuario (Apelido, Nome, Email, Senha) VALUES (?, ?, ?, ?)`;
      const result = await this.db.insert(sql, [apelido, nome, email, senhaBase64]);
      return { apelido, nome, email };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    }
  }

  /**
   * Autentica um usuário
   * @param {string} apelido - Apelido do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário autenticado
   */
  async authenticateUser(apelido, senha) {
    try {
      if (!apelido || !senha) {
        throw new Error('Apelido e senha são obrigatórios');
      }
      
      const user = await this.getUserByApelido(apelido);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
     
      const senhaBase64 = Buffer.from(senha).toString('base64');
      const isPasswordValid = senhaBase64 === user.Senha;
      if (!isPasswordValid) {
        throw new Error('Senha incorreta');
      }
      // Retorna dados do usuário (sem senha)
      return {
        apelido: user.Apelido,
        nome: user.Nome,
        email: user.Email
      };
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por apelido
   * @param {string} apelido - Apelido do usuário
   * @returns {Promise<Object|null>} Dados do usuário
   */
  async getUserByApelido(apelido) {
    try {
      const sql = `
        SELECT 
          Apelido,
          Nome,
          Email,
          Senha
        FROM Usuario
        WHERE Apelido = ?
      `;

      const users = await this.db.query(sql, [apelido]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Erro ao buscar usuário por apelido:', error);
      throw new Error('Falha ao buscar usuário');
    }
  }

 

  /**
   * Valida dados do usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Object} Resultado da validação
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.nome || userData.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!userData.apelido || userData.apelido.trim().length < 3) {
      errors.push('Apelido deve ter pelo menos 3 caracteres');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Email inválido');
    }

    if (!userData.senha || userData.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de email
   * @param {string} email - Email para validar
   * @returns {boolean} Se o email é válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Exporta instância singleton
export const userModel = new UserModel();
export default UserModel; 