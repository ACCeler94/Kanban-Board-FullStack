import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { boardsRoutes } from './routes/boards.routes';
import { tasksRoutes } from './routes/tasks.routes';
import { auth, requiresAuth } from 'express-openid-connect';

const app: Express = express();
const port = 8000;

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: 'http://localhost:8000/',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  routes: {
    login: '/auth/login',
    logout: '/auth/logout',
    callback: '/auth/callback',
  },
  session: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
    rolling: true,
    rollingDuration: 86400, // 1 day
    absoluteDuration: 604800, // 7 days
  },
};
app.use(auth(config));
app.use(express.urlencoded({ extended: false })); // required to handle urlencoded requests
app.use(express.json()); // required to handle form-data request
app.use(cors()); // middleware to enable CORS requests

app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// endpoints
app.use('/api', boardsRoutes);
app.use('/api', tasksRoutes);

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
