import Auth0User from './Auth0User';

declare module 'express-session' {
  interface SessionData {
    auth0User?: Auth0User;
    userId?: string;
  }
}
