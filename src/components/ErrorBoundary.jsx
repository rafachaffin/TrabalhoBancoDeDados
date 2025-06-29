import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log do erro para debugging
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Ops! Algo deu errado</h2>
            <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Recarregar Página
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalhes do erro (desenvolvimento)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 