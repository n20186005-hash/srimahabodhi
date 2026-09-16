/**
 * Server-side weather fetcher.
 *
 * Data is retrieved on the server during the Astro render pass and cached on disk with a
 * short TTL, so repeated renders inside the same window reuse a single response. The rendered
 * values are then kept current in the visitor's browser by the client-side refresher.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CLIMATE_NORMALS,
  buildWeatherApiUrl,
  normaliseWeatherPayload,
  type WeatherDay,
  type WeatherSnapshot
} from './weather-shared';

export * from './weather-shared';

const CACHE_TTL_MS = 10 * 60 * 1000;

function cacheFilePath(): string | null {
  try {
    const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
    if (fs.existsSync(path.join(root, 'package.json'))) {
      return path.join(root, '.cache', 'weather.json');
    }
  } catch {
    /* fall through to the working directory */
  }
  try {
    const cwd = process.cwd();
    return fs.existsSync(path.join(cwd, 'package.json')) ? path.join(cwd, '.cache', 'weather.json') : null;
  } catch {
    return null;
  }
}

function readDiskCache(): { at: number; data: WeatherSnapshot } | null {
  const file = cacheFilePath();
  if (!file) return null;
  try {
    if (!fs.existsSync(file)) return null;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { at: number; data: WeatherSnapshot };
    if (typeof parsed.at !== 'number' || !parsed.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDiskCache(payload: { at: number; data: WeatherSnapshot }): void {
  const file = cacheFilePath();
  if (!file) return;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(payload), 'utf8');
  } catch {
    /* cache writes are best effort */
  }
}

function fallbackSnapshot(now: Date): WeatherSnapshot {
  const normal = CLIMATE_NORMALS[now.getMonth()] ?? CLIMATE_NORMALS[0];

  const days: WeatherDay[] = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const monthNormal = CLIMATE_NORMALS[day.getMonth()] ?? CLIMATE_NORMALS[0];
    return {
      date: day.toISOString().slice(0, 10),
      weatherCode: monthNormal.rainfall >= 150 ? 61 : monthNormal.rainfall >= 60 ? 3 : 1,
      tempMax: monthNormal.tempMax,
      tempMin: monthNormal.tempMin,
      precipitation: Math.round((monthNormal.rainfall / 30) * 10) / 10,
      precipitationProbability: monthNormal.rainfall >= 150 ? 70 : monthNormal.rainfall >= 60 ? 45 : 20,
      uvIndexMax: null,
      windSpeedMax: 12,
      windGustsMax: null
    };
  });

  return {
    ok: false,
    fetchedAt: now.toISOString(),
    timezone: 'Asia/Colombo',
    now: {
      time: now.toISOString(),
      temperature: normal.tempMax,
      apparentTemperature: normal.tempMax + 2,
      humidity: 70,
      precipitation: 0,
      windSpeed: 12,
      windGusts: null,
      uvIndex: null,
      weatherCode: normal.rainfall >= 150 ? 61 : 1,
      isDay: true
    },
    days
  };
}

export async function getWeatherSnapshot(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  const requestedAt = new Date();

  const cached = readDiskCache();
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(buildWeatherApiUrl(latitude, longitude), {
      signal: controller.signal,
      headers: { accept: 'application/json' }
    });
    clearTimeout(timer);

    if (!response.ok) throw new Error(`weather request failed: ${response.status}`);

    const payload = await response.json();
    const snapshot = normaliseWeatherPayload(payload, requestedAt.toISOString());
    if (!snapshot) throw new Error('unexpected weather payload');

    writeDiskCache({ at: Date.now(), data: snapshot });
    return snapshot;
  } catch {
    return cached ? cached.data : fallbackSnapshot(requestedAt);
  }
}
