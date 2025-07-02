/**
 * UserController
 * Controller responsável por gerenciar as rotas relacionadas aos usuários
 * Autenticação, registro e gerenciamento de usuários
 */

import express from 'express';
import { userModel } from '../models/UserModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class UserController {
  constructor() {
    this.router = express.Router();
    this.setupRoutes();
  }

  /**
   * Configura as rotas do controller
   */
  setupRoutes() {
    // Registro de usuário
    this.router.post('/register', asyncHandler(this.registerUser.bind(this)));

    // Login de usuário
    this.router.post('/login', asyncHandler(this.loginUser.bind(this)));

    // Buscar usuário por apelido
    this.router.get('/profile/:apelido', asyncHandler(this.getUserProfile.bind(this)));

    // Atualizar perfil do usuário
    this.router.put('/profile/:apelido', asyncHandler(this.updateUserProfile.bind(this)));

    // Alterar senha
    this.router.put('/change-password/:apelido', asyncHandler(this.changePassword.bind(this)));

    // Excluir conta
    this.router.delete('/delete/:apelido', asyncHandler(this.deleteUser.bind(this)));

    // Estatísticas dos usuários
    this.router.get('/stats', asyncHandler(this.getUserStats.bind(this)));
  }

  /**
   * Registra um novo usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async registerUser(req, res) {
    try {
      const { nome, apelido, email, senha } = req.body;

      // Validação dos dados
      const validation = userModel.validateUserData({ nome, apelido, email, senha });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: validation.errors
        });
      }

      const user = await userModel.registerUser({ nome, apelido, email, senha });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso!',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('já está em uso') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro no registro'
      });
    }
  }

  /**
   * Autentica um usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async loginUser(req, res) {
    console.log('REQ.BODY LOGIN:', req.body);
    try {
      let { apelido, senha, username } = req.body;
      if (!apelido && username) {
        apelido = username;
      }

      if (!apelido || !senha) {
        return res.status(400).json({
          success: false,
          error: 'Apelido e senha são obrigatórios'
        });
      }

      const user = await userModel.authenticateUser(apelido, senha);

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: user
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') || 
                        error.message.includes('incorreta') ? 401 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro no login'
      });
    }
  }

  /**
   * Busca perfil do usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUserProfile(req, res) {
    try {
      const { apelido } = req.params;
      const user = await userModel.getUserByApelido(apelido);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          message: `Usuário com apelido ${apelido} não foi encontrado`
        });
      }

      // Remove a senha dos dados retornados
      const { senha, ...userProfile } = user;

      res.json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao buscar perfil do usuário'
      });
    }
  }

  /**
   * Atualiza perfil do usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async updateUserProfile(req, res) {
    try {
      const { apelido } = req.params;
      const { nome, email } = req.body;

      // Validações básicas
      if (nome && nome.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Nome deve ter pelo menos 2 caracteres'
        });
      }

      if (email && !userModel.isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Email inválido'
        });
      }

      const updateData = {};
      if (nome) updateData.nome = nome.trim();
      if (email) updateData.email = email.trim();

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum dado para atualizar'
        });
      }

      const result = await userModel.updateUser(apelido, updateData);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 
                        error.message.includes('já está em uso') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro ao atualizar perfil'
      });
    }
  }

  /**
   * Altera senha do usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async changePassword(req, res) {
    try {
      const { apelido } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Senha atual e nova senha são obrigatórias'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'A nova senha deve ter pelo menos 6 caracteres'
        });
      }

      const result = await userModel.changePassword(apelido, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso!',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') || 
                        error.message.includes('incorreta') ? 401 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro ao alterar senha'
      });
    }
  }

  /**
   * Exclui conta do usuário
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async deleteUser(req, res) {
    try {
      const { apelido } = req.params;
      const { senha } = req.body;

      if (!senha) {
        return res.status(400).json({
          success: false,
          error: 'Senha é obrigatória para confirmar a exclusão'
        });
      }

      const result = await userModel.deleteUser(apelido, senha);

      res.json({
        success: true,
        message: 'Conta excluída com sucesso!',
        data: result
      });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') || 
                        error.message.includes('incorreta') ? 401 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Erro ao excluir conta'
      });
    }
  }

  /**
   * Obtém estatísticas dos usuários
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  async getUserStats(req, res) {
    try {
      const stats = await userModel.getUserStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Erro ao obter estatísticas dos usuários'
      });
    }
  }

  /**
   * Retorna o router configurado
   * @returns {Object} Router Express
   */
  getRouter() {
    return this.router;
  }
}

// Exporta instância singleton
export const userController = new UserController();
export default UserController; 