// Connect IA - JavaScript compilado
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Inicializar React
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker (se disponível)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Analytics (se configurado)
if (typeof gtag !== 'undefined') {
  gtag('config', 'GA_MEASUREMENT_ID');
}
