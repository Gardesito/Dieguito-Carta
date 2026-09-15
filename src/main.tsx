import React from 'react'
import './i18n'
import ReactDOM from 'react-dom/client'
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/editor.css'
import App from './app/App'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
