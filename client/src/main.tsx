import { Auth0Provider } from '@auth0/auth0-react';
import '@fontsource-variable/plus-jakarta-sans'; // Supports weights 200-800
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { lightTheme } from './theme/theme.ts';

const queryClient = new QueryClient();

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const frontEndUrl = import.meta.env.VITE_SERVER_URL;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      cacheLocation='localstorage' // Added to solve issue with non persisting auth0 session and third party cookies
      useRefreshTokens={true}
      authorizationParams={{
        redirect_uri: frontEndUrl,
        audience: 'KanbanBoardAPI',
        scope: 'openid profile email',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>
);
