/* eslint-disable @typescript-eslint/no-misused-promises */
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import { authRoutes } from './routes/auth.routes';
import { boardsRoutes } from './routes/boards.routes';
import { tasksRoutes } from './routes/tasks.routes';
import { userRoutes } from './routes/users.routes';
import Auth0User from './types/Auth0User';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    auth0User: Auth0User;
  }
}

const app: Express = express();
const port = 8000;

// Middleware to enable CORS requests
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

// Express session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
      sameSite: 'none',
    },
  })
);

app.use(express.urlencoded({ extended: false })); // Required to handle urlencoded requests
app.use(express.json()); // Required to handle form-data request

// Middleware to log request to the console
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Endpoints
app.use('/auth', authRoutes);
app.use('/api', boardsRoutes);
app.use('/api', tasksRoutes);
app.use('/api', userRoutes);

// Serve avatar images and other static files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Serve frontend build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve React index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.use((req, res) => {
  res.status(404).send('404 not found...');
});

app.use((err: Error, req: Request, res: Response) => {
  const message = err.message || 'Internal server error.';
  res.status(500).json({ message });
});

app.listen(port, () => {
  console.log(`[Server]: I am running at http://localhost:${port}`);
});
