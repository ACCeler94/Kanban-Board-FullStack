import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { boardsRoutes } from './routes/boards.routes';
import { tasksRoutes } from './routes/tasks.routes';

const app: Express = express();
const port = 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, this is Express + TypeScript');
});

app.use(express.urlencoded({ extended: false })); // required to handle urlencoded requests
app.use(express.json()); // required to handle form-data request
app.use(cors()); // middleware to enable CORS requests

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
