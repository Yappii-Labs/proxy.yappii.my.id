import cors from 'cors';
import express, {
  type Request,
  type Response,
  type Application,
} from 'express';
import path from 'path';
import wakatime from './routes/wakatime.route';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OK' });
});

app.use('/wakatime', wakatime);

export default app;
