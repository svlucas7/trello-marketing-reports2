import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './pages/App.tsx'

// Tratamento de erro global para debugging
window.addEventListener('error', (e) => {
  console.error('Erro global capturado:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejeitada não tratada:', e.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento root não encontrado');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
