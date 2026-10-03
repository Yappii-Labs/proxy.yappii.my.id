import cors from 'cors';
import express, {
  type Request,
  type Response,
  type Application,
} from 'express';
import path from 'path';
import wakatime from './routes/wakatime.route';

const prefix: string = "api";
const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(`/${prefix}/wakatime`, wakatime);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    data: null,
    errors: null,
  });
});

export default app;
