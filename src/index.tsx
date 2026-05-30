import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { PokemonProvider } from './contexts/PokemonContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <PokemonProvider>
        <App />
      </PokemonProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
