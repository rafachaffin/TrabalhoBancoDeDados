import './LoadingSpinner.css'

const LoadingSpinner = ({ size = 'medium', message = 'Carregando...' }) => {
  return (
    <div className={`loading-container loading-${size}`}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner 