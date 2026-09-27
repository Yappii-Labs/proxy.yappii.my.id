import type { Request, Response } from 'express';
import { fetchWakaTimeJson } from '../lib/wakatime-cache';

const WAKATIME_URL = 'https://wakatime.com/api/v1';

export async function getStats(req: Request, res: Response) {
  try {
    const { range } = req.params;
    const token = req.headers['x-api-token'] as string;

    const data = await fetchWakaTimeJson(
      `${WAKATIME_URL}/users/current/stats/${range}`,
      token,
    );
    res.status(200).json({
      message: `Stats fetched for range: ${range}`,
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getLanguages(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;

    const result = await fetchWakaTimeJson<{
      data?: { languages?: unknown[] };
    }>(`${WAKATIME_URL}/users/current/stats/all_time`, token);
    res.status(200).json({
      message: 'Languages fetched',
      data: result.data?.languages ?? [],
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getUserTime(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;

    const data = await fetchWakaTimeJson(
      `${WAKATIME_URL}/users/current/time`,
      token,
    );
    res.status(200).json({
      message: 'Time stats fetched',
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getSummaries(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;
    const { start, end } = req.query;

    let url = `${WAKATIME_URL}/users/current/summaries`;
    const params = new URLSearchParams();
    if (start) params.append('start', start as string);
    if (end) params.append('end', end as string);
    if (params.toString()) url += `?${params.toString()}`;

    const data = await fetchWakaTimeJson(url, token);
    res.status(200).json({
      message: 'Summaries fetched',
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getAllTimeSinceToday(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;
    const data = await fetchWakaTimeJson(
      `${WAKATIME_URL}/users/current/all_time_since_today`,
      token,
    );
    res.status(200).json({
      message: 'All time since today fetched',
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getGoals(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;
    const data = await fetchWakaTimeJson(
      `${WAKATIME_URL}/users/current/goals`,
      token,
    );
    res.status(200).json({
      message: 'Goals fetched',
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getProjects(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;
    const data = await fetchWakaTimeJson(
      `${WAKATIME_URL}/users/current/projects`,
      token,
    );
    res.status(200).json({
      message: 'Projects fetched',
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}

export async function getLeaders(req: Request, res: Response) {
  try {
    const token = req.headers['x-api-token'] as string;
    const data = await fetchWakaTimeJson(
      `${WAKATIME_URL}/users/current/leaders`,
      token,
    );
    res.status(200).json({
      message: 'Leaders fetched',
      data,
      errors: null,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      message: err.message,
      data: null,
      errors: err.stack,
    });
  }
}
