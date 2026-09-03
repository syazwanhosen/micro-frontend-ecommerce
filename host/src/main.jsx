import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { mountToaster } from '@mfe/shared';
import App from './App.jsx';
import '@mfe/shared/styles.css';

// The host renders toasts for every micro frontend; remotes just emit events.
mountToaster();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
