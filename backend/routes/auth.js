import express from 'express';

export default function authRoutes(dbService) {
  const router = express.Router();

  // Cadastro de usuário
  router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
      }
      // Chama o método do serviço para cadastrar o usuário
      const user = await dbService.registerUser({ name, email, password });
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Erro ao cadastrar usuário.' });
    }
  });

  // Login de usuário
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
      }
      // Chama o método do serviço para autenticar o usuário
      const user = await dbService.loginUser({ email, password });
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos.' });
      }
      res.status(200).json({ message: 'Login realizado com sucesso!', user });
    } catch (error) {
      res.status(400).json({ error: error.message || 'Erro ao fazer login.' });
    }
  });

  return router;
} 