import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './theme/ThemeContext';
import { AppProvider } from './state/AppState';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
