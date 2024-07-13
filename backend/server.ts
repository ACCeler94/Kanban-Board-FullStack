import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { boardsRoutes } from './routes/boards.routes';
import { tasksRoutes } from './routes/tasks.routes';
import { auth, ConfigParams, requiresAuth } from 'express-openid-connect';
import { userRoutes } from './routes/users.routes';
import session from 'express-session';
import { authRoutes } from './routes/auth.routes';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

const app: Express = express();
const port = 8000;

export const auth0Config: ConfigParams = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: 'http://localhost:8000',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  session: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
    rolling: true,
    absoluteDuration: 86400, // 1 day
  },
  authorizationParams: {
    scope: 'openid profile email',
  },
};

// Express session configuration
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 86400,
//     },
//   })
// );

app.use(express.urlencoded({ extended: false })); // required to handle urlencoded requests
app.use(express.json()); // required to handle form-data request
app.use(cors()); // middleware to enable CORS requests

// middleware to log request to the console
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

app.use(auth(auth0Config));

app.post('/callback', (req, res) => {
  console.log('Callback route reached - TEST 2');
  res.redirect('http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// app.get('/profile', requiresAuth(), (req, res) => {
//   res.send(JSON.stringify(req.oidc.user));
// });

// endpoints
app.use('/test', authRoutes);
app.use('/api', boardsRoutes);
app.use('/api', tasksRoutes);
app.use('/api', userRoutes);

// // Serve static files from the React app
// app.use(express.static(path.join(__dirname, '/client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });

app.use((req, res) => {
  res.status(404).send('404 not found...');
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: 'An error occurred.' });
});

app.listen(port, () => {
  console.log(`[Server]: I am running at http://localhost:${port}`);
});
