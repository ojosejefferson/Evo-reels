import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Verifica se o elemento existe antes de renderizar
const container = document.getElementById('evo-reels-root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
