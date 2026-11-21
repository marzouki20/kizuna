import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class AppErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ margin: '48px auto', maxWidth: 760, padding: 24, fontFamily: 'sans-serif', color: '#7f1d1d' }}>
          <h1>Erreur au chargement de RoboCore</h1>
          <p>Le détail ci-dessous permet d’identifier le problème au lieu d’afficher une page blanche.</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#fef2f2', padding: 16, borderRadius: 8 }}>
            {this.state.error.stack || this.state.error.message}
          </pre>
        </main>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
