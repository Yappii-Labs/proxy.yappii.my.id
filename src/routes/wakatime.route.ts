import { Router } from 'express';
import {
  getStats,
  getLanguages,
  getUserTime,
  getSummaries,
  getAllTimeSinceToday,
  getGoals,
  getProjects,
  getLeaders,
} from '../controllers/wakatime.controller';
import { requireToken } from '../middlewares/require-token';

const wakatime = Router();

wakatime.get('/stats/:range', requireToken, getStats);
wakatime.get('/languages', getLanguages);
wakatime.get('/time', getUserTime);
wakatime.get('/summaries', getSummaries);
wakatime.get('/all-time-since-today', getAllTimeSinceToday);
wakatime.get('/goals', getGoals);
wakatime.get('/projects', getProjects);
wakatime.get('/leaders', getLeaders);

export default wakatime;
