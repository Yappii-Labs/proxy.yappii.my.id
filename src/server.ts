import cors from 'cors';
import express, {
  type Request,
  type Response,
  type Application,
} from 'express';

const app: Application = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OK' });
});

app.listen(PORT, () => console.log(`Running on.. http://localhost:${PORT}`));
