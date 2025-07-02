import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    apelido: '',
    senha: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Autenticar usuário via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apelido: formData.apelido,
          senha: formData.senha
        })
      })

      const data = await response.json()
      console.log('RESPOSTA DO LOGIN:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login')
      }

      console.log('DADOS DO LOGIN:', data)

      // Usar a função login do contexto
      const user = {
        nome: data.data.nome,
        email: data.data.email,
        apelido: data.data.apelido
      }
      login(user)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Entrar no CineBoxd</h1>
        <p>Faça login para salvar suas avaliações</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <div className="input-wrapper">
            <User size={20} className="input-icon" />
            <input
              type="text"
              name="apelido"
              value={formData.apelido}
              onChange={handleChange}
              placeholder="Seu apelido"
              required
              className="auth-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder="Sua senha"
              required
              className="auth-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`auth-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Não tem uma conta?{' '}
          <Link to="/register" className="auth-link">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login 