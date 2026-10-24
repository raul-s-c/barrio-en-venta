import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerServiceWorker, UpdateBanner } from './updates';
import './style.css';
registerServiceWorker();
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <UpdateBanner />
  </React.StrictMode>,
);
