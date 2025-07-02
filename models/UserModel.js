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
      // Codifica a senha em Base64
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
      // Busca o usuário
      const user = await this.getUserByApelido(apelido);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      // Codifica a senha em Base64 para comparar
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
      console.error('❌ Erro na autenticação:', error);
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
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Dados do usuário
   */
  async getUserByEmail(email) {
    try {
      const sql = `
        SELECT 
          Apelido,
          Nome,
          Email,
          Senha
        FROM Usuario
        WHERE Email = ?
      `;

      const users = await this.db.query(sql, [email]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw new Error('Falha ao buscar usuário');
    }
  }

  /**
   * Busca usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object|null>} Dados do usuário
   */
  async getUserById(id) {
    try {
      const sql = `
        SELECT 
          ID_Usuario,
          nome,
          apelido,
          email,
          data_cadastro
        FROM usuario
        WHERE ID_Usuario = ?
      `;

      const users = await this.db.query(sql, [id]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      throw new Error('Falha ao buscar usuário');
    }
  }

  /**
   * Atualiza dados do usuário
   * @param {string} apelido - Apelido do usuário
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  async updateUser(apelido, updateData) {
    try {
      const { nome, email } = updateData;

      // Verifica se o usuário existe
      const existingUser = await this.getUserByApelido(apelido);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Se estiver atualizando email, verifica se já existe
      if (email && email !== existingUser.Email) {
        const existingEmail = await this.getUserByEmail(email);
        if (existingEmail) {
          throw new Error('Email já está em uso');
        }
      }

      // Constrói a query de atualização
      const updates = [];
      const params = [];

      if (nome) {
        updates.push('Nome = ?');
        params.push(nome);
      }

      if (email) {
        updates.push('Email = ?');
        params.push(email);
      }

      if (updates.length === 0) {
        throw new Error('Nenhum dado para atualizar');
      }

      params.push(apelido);
      const sql = `UPDATE Usuario SET ${updates.join(', ')} WHERE Apelido = ?`;

      const result = await this.db.update(sql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Falha ao atualizar usuário');
      }

      return result;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Altera senha do usuário
   * @param {string} apelido - Apelido do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resultado da alteração
   */
  async changePassword(apelido, currentPassword, newPassword) {
    try {
      // Busca o usuário
      const user = await this.getUserByApelido(apelido);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica a senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.Senha);
      if (!isCurrentPasswordValid) {
        throw new Error('Senha atual incorreta');
      }

      // Valida a nova senha
      if (!newPassword || newPassword.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }

      // Criptografa a nova senha
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Atualiza a senha
      const sql = `UPDATE Usuario SET Senha = ? WHERE Apelido = ?`;
      const result = await this.db.update(sql, [hashedNewPassword, apelido]);

      if (result.affectedRows === 0) {
        throw new Error('Falha ao alterar senha');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      throw error;
    }
  }

  /**
   * Exclui usuário
   * @param {string} apelido - Apelido do usuário
   * @param {string} senha - Senha para confirmação
   * @returns {Promise<Object>} Resultado da exclusão
   */
  async deleteUser(apelido, senha) {
    try {
      // Busca o usuário
      const user = await this.getUserByApelido(apelido);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(senha, user.Senha);
      if (!isPasswordValid) {
        throw new Error('Senha incorreta');
      }

      // Inicia transação para excluir usuário e suas avaliações
      const connection = await this.db.beginTransaction();

      try {
        // Exclui avaliações do usuário
        await connection.execute(
          'DELETE FROM Avalia WHERE Apelido = ?',
          [apelido]
        );

        // Exclui o usuário
        const result = await connection.execute(
          'DELETE FROM Usuario WHERE Apelido = ?',
          [apelido]
        );

        await this.db.commitTransaction(connection);

        if (result[0].affectedRows === 0) {
          throw new Error('Falha ao excluir usuário');
        }

        return { affectedRows: result[0].affectedRows };
      } catch (error) {
        await this.db.rollbackTransaction(connection);
        throw error;
      }
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas dos usuários
   * @returns {Promise<Object>} Estatísticas
   */
  async getUserStats() {
    try {
      const stats = {};
      
      // Total de usuários
      const [totalUsers] = await this.db.query('SELECT COUNT(*) as count FROM usuario');
      stats.totalUsers = totalUsers.count;
      
      // Usuários mais ativos (com mais avaliações)
      const activeUsers = await this.db.query(`
        SELECT 
          u.apelido,
          u.nome,
          COUNT(av.ID_Avalia) as review_count
        FROM usuario u
        LEFT JOIN avalia av ON u.apelido = av.apelido
        GROUP BY u.ID_Usuario, u.apelido, u.nome
        ORDER BY review_count DESC
        LIMIT 10
      `);
      stats.activeUsers = activeUsers;
      
      // Novos usuários (últimos 30 dias)
      const newUsers = await this.db.query(`
        SELECT COUNT(*) as count
        FROM usuario
        WHERE data_cadastro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      stats.newUsersLast30Days = newUsers[0].count;
      
      return stats;
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas dos usuários:', error);
      throw new Error('Falha ao obter estatísticas dos usuários');
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