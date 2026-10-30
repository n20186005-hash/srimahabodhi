/** Optional server/build consumer. Missing data stays unavailable; no fabricated fallback. */
import { buildWeatherApiUrl, normaliseWeatherPayload, type WeatherSnapshot } from './weather-shared';
export * from './weather-shared';
export async function getWeatherSnapshot(latitude: number, longitude: number): Promise<WeatherSnapshot | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(buildWeatherApiUrl(latitude, longitude), { signal: controller.signal, cache: 'no-store' });
    return response.ok ? normaliseWeatherPayload(await response.json(), new Date().toISOString()) : null;
  } catch { return null; } finally { clearTimeout(timer); }
}
