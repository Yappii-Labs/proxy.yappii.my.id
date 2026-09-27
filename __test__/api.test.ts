import dotenv from 'dotenv';
import app from '../src/app';
import request from 'supertest';
import { clearWakaTimeCache } from '../src/lib/wakatime-cache';

dotenv.config({ path: '.env.local', quiet: true });

const apiToken = process.env.WAKATIME_API_KEY || 'jest-test-api-key';
const authorization = `Basic ${Buffer.from(apiToken).toString('base64')}`;
const upstreamResponse = { data: { id: 'fixture', total_seconds: 120 } };

const wakatimeRoutes = [
  {
    path: '/wakatime/stats/last_7_days',
    upstreamPath: '/users/current/stats/last_7_days',
    message: 'Stats fetched for range: last_7_days',
  },
  {
    path: '/wakatime/languages',
    upstreamPath: '/users/current/stats/all_time',
    message: 'Languages fetched',
    response: { data: { languages: [{ name: 'TypeScript' }] } },
    expectedData: [{ name: 'TypeScript' }],
  },
  {
    path: '/wakatime/time',
    upstreamPath: '/users/current/time',
    message: 'Time stats fetched',
  },
  {
    path: '/wakatime/summaries?start=2024-01-01&end=2024-01-07',
    upstreamPath: '/users/current/summaries?start=2024-01-01&end=2024-01-07',
    message: 'Summaries fetched',
  },
  {
    path: '/wakatime/all-time-since-today',
    upstreamPath: '/users/current/all_time_since_today',
    message: 'All time since today fetched',
  },
  {
    path: '/wakatime/goals',
    upstreamPath: '/users/current/goals',
    message: 'Goals fetched',
  },
  {
    path: '/wakatime/projects',
    upstreamPath: '/users/current/projects',
    message: 'Projects fetched',
  },
  {
    path: '/wakatime/leaders',
    upstreamPath: '/users/current/leaders',
    message: 'Leaders fetched',
  },
];

describe('API', () => {
  beforeEach(() => clearWakaTimeCache());

  it('returns the health response', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'OK' });
  });

  it('returns an empty language list when WakaTime has no language data', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ data: {} })));

    const response = await request(app)
      .get('/wakatime/languages')
      .set('x-api-token', apiToken);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('fetches summaries without date filters', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(upstreamResponse)));

    const response = await request(app)
      .get('/wakatime/summaries')
      .set('x-api-token', apiToken);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://wakatime.com/api/v1/users/current/summaries',
      expect.any(Object),
    );
  });

  it('reuses cached WakaTime responses for repeated requests', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(upstreamResponse)));

    const firstResponse = await request(app)
      .get('/wakatime/time')
      .set('x-api-token', apiToken);
    const secondResponse = await request(app)
      .get('/wakatime/time')
      .set('x-api-token', apiToken);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.body).toEqual(firstResponse.body);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(wakatimeRoutes)(
    'returns a successful response for $path',
    async ({ path, upstreamPath, message, response: fixture, expectedData }) => {
      const payload = fixture ?? upstreamResponse;
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify(payload)));

      const result = await request(app)
        .get(path)
        .set('x-api-token', apiToken);

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        message,
        data: expectedData ?? payload,
        errors: null,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        `https://wakatime.com/api/v1${upstreamPath}`,
        expect.objectContaining({
          headers: { Authorization: authorization },
        }),
      );
    },
  );

  it.each(wakatimeRoutes)(
    'returns an error response when WakaTime cannot be reached for $path',
    async ({ path }) => {
      jest
        .spyOn(global, 'fetch')
        .mockRejectedValue(new Error('upstream offline'));

      const response = await request(app)
        .get(path)
        .set('x-api-token', apiToken);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('upstream offline');
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toContain('Error: upstream offline');
    },
  );
});