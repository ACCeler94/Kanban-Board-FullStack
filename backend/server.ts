/* eslint-disable @typescript-eslint/no-misused-promises */
import { RedisStore } from 'connect-redis';
import cors from 'cors';
import express, { Express, Request, RequestHandler, Response } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import { createClient } from 'redis';
import { authRoutes } from './routes/auth.routes';
import { boardsRoutes } from './routes/boards.routes';
import { tasksRoutes } from './routes/tasks.routes';
import { userRoutes } from './routes/users.routes';
import timeout from 'connect-timeout';

const app: Express = express();
const port = 8000;

// Middleware to enable CORS requests
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.auth0.com',
          'https://cdn.jsdelivr.net',
          'https://apis.google.com',
        ],
        imgSrc: ["'self'", 'data:', 'https://cdn.auth0.com', 'https://lh3.googleusercontent.com'],
        connectSrc: ["'self'", `https://${process.env.AUTH0_DOMAIN}`],
        frameSrc: ["'self'", `https://${process.env.AUTH0_DOMAIN}`],
      },
    },
    hidePoweredBy: true,
  })
);

app.set('trust proxy', 1);

// --- Configure Redis for session storage ---
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Initialize store.
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'myapp:',
});

// Express session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: redisStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
      sameSite: 'none',
    },
  })
);

app.use(express.json()); // Required to handle form-data request

// Middleware to log request to the console
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

const timeoutMiddleware: RequestHandler = timeout('15s');

// API router
const apiRouter = express.Router();
apiRouter.use(timeoutMiddleware);
apiRouter.use((req, res, next) => {
  if (req.timedout) {
    return res.status(408).json({ message: 'Request Timeout' });
  }
  next();
});
apiRouter.use(boardsRoutes);
apiRouter.use(tasksRoutes);
apiRouter.use(userRoutes);
app.use('/api', apiRouter);

// Auth router
const authRouterWrapper = express.Router();
authRouterWrapper.use(timeoutMiddleware);
authRouterWrapper.use((req, res, next) => {
  if (req.timedout) {
    return res.status(408).json({ message: 'Request Timeout' });
  }
  next();
});
authRouterWrapper.use(authRoutes);
app.use('/auth', authRouterWrapper);

// Serve avatar images and other static files
app.use('/images/userAvatars', express.static('/mnt/data/avatars')); // Render persistent disk
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
