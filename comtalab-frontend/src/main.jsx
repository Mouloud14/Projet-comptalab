// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // Importe le routeur
import App from './App.jsx'
import './index.css' // CSS global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* App DOIT être à l'intérieur de BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)