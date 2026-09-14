import React from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null
    }
  }

  static getDerivedStateFromError(error) {
    return {
      error
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('VELTO REACT ERROR:', error)
    console.error('VELTO ERROR INFO:', errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            padding: '20px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box'
          }}
        >
          <h2 style={{ color: '#ff5555' }}>
            VeltoGifts Error
          </h2>

          <p>
            {this.state.error.message}
          </p>

          <pre>
            {this.state.error.stack}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
