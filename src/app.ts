import cors from 'cors';
import express, {
  type Request,
  type Response,
  type Application,
} from 'express';
import wakatime from './routes/wakatime.route';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OK' });
});

app.use('/wakatime', wakatime);

export default app;
