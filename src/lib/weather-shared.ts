/**
 * Browser-safe part of the weather layer: types, request builder, label mapping and the
 * rule engine that turns raw numbers into plain-language advice for visitors.
 * Imported both by the server-side fetcher and by the client-side refresher.
 */

export interface WeatherNow {
  time: string;
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  windSpeed: number | null;
  windGusts: number | null;
  uvIndex: number | null;
  weatherCode: number | null;
  isDay: boolean;
}

export interface WeatherDay {
  date: string;
  weatherCode: number | null;
  tempMax: number | null;
  tempMin: number | null;
  precipitation: number | null;
  precipitationProbability: number | null;
  uvIndexMax: number | null;
  windSpeedMax: number | null;
  windGustsMax: number | null;
}

export interface WeatherSnapshot {
  ok: boolean;
  fetchedAt: string;
  timezone: string;
  now: WeatherNow;
  days: WeatherDay[];
}

export interface ClimateNormal {
  tempMax: number;
  tempMin: number;
  rainfall: number;
}

/**
 * Long-term monthly climate normals for Anuradhapura (dry zone): rounded reference values
 * used only as an offline fallback when live data cannot be retrieved.
 * Basis: published climatological normals for the North Central Province.
 */
export const CLIMATE_NORMALS: ClimateNormal[] = [
  { tempMax: 30, tempMin: 21, rainfall: 90 },
  { tempMax: 32, tempMin: 22, rainfall: 60 },
  { tempMax: 34, tempMin: 23, rainfall: 60 },
  { tempMax: 34, tempMin: 24, rainfall: 120 },
  { tempMax: 33, tempMin: 25, rainfall: 90 },
  { tempMax: 32, tempMin: 25, rainfall: 25 },
  { tempMax: 32, tempMin: 24, rainfall: 20 },
  { tempMax: 32, tempMin: 24, rainfall: 30 },
  { tempMax: 32, tempMin: 24, rainfall: 60 },
  { tempMax: 31, tempMin: 23, rainfall: 180 },
  { tempMax: 30, tempMin: 22, rainfall: 220 },
  { tempMax: 29, tempMin: 21, rainfall: 200 }
];

export function buildWeatherApiUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,uv_index',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max',
    forecast_days: '7',
    timezone: 'Asia/Colombo'
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export interface WeatherCodeText {
  icon: string;
  si: string;
  en: string;
}

/** WMO weather interpretation codes → visitor-facing label. */
export function weatherCodeToText(code: number | null): WeatherCodeText {
  if (code === null || Number.isNaN(code)) return { icon: '🌡️', si: 'තොරතුරු නැත', en: 'No data' };
  if (code === 0) return { icon: '☀️', si: 'පැහැදිලි අහස', en: 'Clear sky' };
  if (code === 1) return { icon: '🌤️', si: 'බොහෝ දුරට පැහැදිලි', en: 'Mainly clear' };
  if (code === 2) return { icon: '⛅', si: 'අර්ධ වලාකුළු', en: 'Partly cloudy' };
  if (code === 3) return { icon: '☁️', si: 'වලාකුළු සහිත', en: 'Overcast' };
  if (code === 45 || code === 48) return { icon: '🌫️', si: 'මීදුම', en: 'Fog' };
  if (code >= 51 && code <= 55) return { icon: '🌦️', si: 'සැහැල්ලු වැසි', en: 'Drizzle' };
  if (code === 56 || code === 57) return { icon: '🌧️', si: 'හිම මිශ්‍ර වැසි', en: 'Freezing drizzle' };
  if (code >= 61 && code <= 65) return { icon: '🌧️', si: 'වැසි', en: 'Rain' };
  if (code === 66 || code === 67) return { icon: '🌧️', si: 'හිම මිශ්‍ර වැසි', en: 'Freezing rain' };
  if (code >= 71 && code <= 77) return { icon: '❄️', si: 'හිම පතනය', en: 'Snow' };
  if (code >= 80 && code <= 82) return { icon: '🌦️', si: 'වැසි වැසි', en: 'Rain showers' };
  if (code === 85 || code === 86) return { icon: '🌨️', si: 'හිම වැසි', en: 'Snow showers' };
  if (code === 95) return { icon: '⛈️', si: 'ගිගුරුම් සහිත වැසි', en: 'Thunderstorm' };
  if (code === 96 || code === 99) return { icon: '⛈️', si: 'ගිගුරුම් සහිත කුණාටු', en: 'Thunderstorm with hail' };
  return { icon: '🌡️', si: 'තොරතුරු නැත', en: 'No data' };
}

export function formatNumber(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

/* ------------------------------------------------------------------ *
 * Plain-language helpers: turn raw numbers into words a visitor uses
 * ------------------------------------------------------------------ */

export interface HumanLabel {
  si: string;
  en: string;
}

/** Wind speed in km/h → everyday wording (no Beaufort jargon). */
export function windLabel(speed: number | null): HumanLabel {
  if (speed === null) return { si: 'තොරතුරු නැත', en: 'no data' };
  if (speed < 12) return { si: 'සැහැල්ලු සුළඟ', en: 'light breeze' };
  if (speed < 29) return { si: 'සුළඟ', en: 'breezy' };
  if (speed < 50) return { si: 'සුළඟ ප්‍රබලයි', en: 'windy' };
  return { si: 'ප්‍රබල සුළං', en: 'strong wind' };
}

/** UV index → everyday wording. */
export function uvLabel(index: number | null): HumanLabel {
  if (index === null) return { si: 'තොරතුරු නැත', en: 'no data' };
  if (index < 3) return { si: 'අඩුයි', en: 'low' };
  if (index < 6) return { si: 'මධ්‍යම', en: 'moderate' };
  if (index < 8) return { si: 'ප්‍රබලයි', en: 'strong' };
  if (index < 11) return { si: 'ඉතා ප්‍රබලයි', en: 'very strong' };
  return { si: 'අතිශයින් ප්‍රබලයි', en: 'extreme' };
}

/** Relative humidity → how the air actually feels. */
export function humidityLabel(humidity: number | null): HumanLabel {
  if (humidity === null) return { si: 'තොරතුරු නැත', en: 'no data' };
  if (humidity >= 80) return { si: 'තෙතමනය වැඩි, ගුලි වූ වාතය', en: 'humid and muggy' };
  if (humidity >= 60) return { si: 'තරමක් තෙත්', en: 'slightly muggy' };
  if (humidity <= 35) return { si: 'වියළි වාතය', en: 'dry air' };
  return { si: 'සුවපහසු', en: 'comfortable' };
}

/** What the body will feel, comparing actual vs apparent temperature. */
export function feelsLabel(now: WeatherNow): HumanLabel {
  const actual = now.temperature;
  const feels = now.apparentTemperature ?? actual;
  if (actual === null || feels === null) return { si: 'තොරතුරු නැත', en: 'no data' };
  if (feels >= actual + 3) return { si: 'උෂ්ණත්වමානයට වඩා උණුසුම් ලෙස දැනේ', en: 'feels hotter than the thermometer' };
  if (feels <= actual - 3) return { si: 'උෂ්ණත්වමානයට වඩා සිසිල් ලෙස දැනේ', en: 'feels cooler than the thermometer' };
  return { si: 'උෂ්ණත්වමානයට සමානව දැනේ', en: 'feels about like the thermometer' };
}

/* ------------------------------------------------------------------ *
 * Visitor advice engine
 * ------------------------------------------------------------------ */

export interface WeatherSiteProfile {
  /** Footwear is removed at the sacred precinct (hot / wet ground matters). */
  barefootGround: boolean;
  /** Climbs and exposed high places nearby (Mihintale steps, stupa terraces). */
  mountain: boolean;
  /** Open-air tanks and reservoir edges. */
  waterside: boolean;
  /** Soft-light photography is a visitor goal. */
  photography: boolean;
  /** Coastal setting (tide, surf, reef safety copy). */
  coastal: boolean;
}

/** Anuradhapura: inland sacred city in the dry zone, with the Mihintale hill nearby. */
export const ANURADHAPURA_PROFILE: WeatherSiteProfile = {
  barefootGround: true,
  mountain: true,
  waterside: true,
  photography: true,
  coastal: false
};

export interface WeatherAdvice {
  icon: string;
  si: string;
  en: string;
}

/** Shared styling so server-rendered and client-refreshed advice look identical. */
export const ADVICE_CLASS = {
  risk: 'rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold leading-6 text-red-800',
  item: 'rounded-2xl bg-[#f7eedc] p-4 text-sm leading-6 text-[#5e4c3c]',
  en: 'mt-1 block text-xs font-normal opacity-80'
};

export interface WeatherAdviceBlock {
  headline: { si: string; en: string };
  /** Highest priority: shown first and highlighted. Empty = nothing to warn about. */
  risks: WeatherAdvice[];
  /** 出行穿搭 */
  dress: WeatherAdvice[];
  /** 游玩安排 */
  plan: WeatherAdvice[];
  /** 随身物品 */
  carry: WeatherAdvice[];
}

const isThunder = (code: number | null) => code !== null && code >= 95;
const isHeavyRain = (code: number | null) =>
  code !== null && ((code >= 64 && code <= 67) || (code >= 74 && code <= 77) || code === 82 || code === 86);
const isLightRain = (code: number | null) =>
  code !== null && ((code >= 51 && code <= 57) || code === 61 || code === 63 || code === 80);
const isFog = (code: number | null) => code === 45 || code === 48;
const isClear = (code: number | null) => code === 0 || code === 1;
const isCloudy = (code: number | null) => code === 2 || code === 3;

/**
 * Translate the forecast into advice a visitor can act on without any interpretation:
 * risks first, then how to dress, how to plan the visit and what to carry.
 * Items whose condition is not met are simply not produced, so nothing is padded out.
 */
export function buildWeatherAdvice(
  snapshot: WeatherSnapshot,
  profile: WeatherSiteProfile = ANURADHAPURA_PROFILE
): WeatherAdviceBlock {
  const now = snapshot.now;
  const today = snapshot.days[0] ?? null;

  const max = today?.tempMax ?? now.temperature;
  const min = today?.tempMin ?? null;
  const swing = max !== null && min !== null ? max - min : null;
  const rainChance = today?.precipitationProbability ?? null;
  const rainSum = today?.precipitation ?? null;
  const uv = today?.uvIndexMax ?? now.uvIndex ?? null;
  const wind = now.windSpeed ?? today?.windSpeedMax ?? null;
  const gust = now.windGusts ?? today?.windGustsMax ?? null;
  const code = now.weatherCode ?? today?.weatherCode ?? null;
  const feels = now.apparentTemperature ?? null;
  const humidity = now.humidity ?? null;

  const thunder = isThunder(code);
  const heavy = isHeavyRain(code) || (rainSum !== null && rainSum >= 20);
  const lightRain = !heavy && (isLightRain(code) || (now.precipitation ?? 0) > 0);
  const wetGround = heavy || lightRain || (rainChance ?? 0) >= 60;
  const text = weatherCodeToText(code);
  const windWord = windLabel(wind);
  const uvWord = uvLabel(uv);

  const risks: WeatherAdvice[] = [];
  const dress: WeatherAdvice[] = [];
  const plan: WeatherAdvice[] = [];
  const carry: WeatherAdvice[] = [];

  /* --- 风险提醒：条件满足才出现，优先级最高 --- */
  if (thunder) {
    risks.push({
      icon: '⛈️',
      si: 'අකුණු සහිත වැසි ඇති විය හැක. විවෘත බිම්වල සහ විශාල ගස් යට නොසිටින්න; උස් ස්ථාන සහ පියගැට තරණය කල් දමන්න.',
      en: 'Thunderstorm possible. Avoid open ground and large trees; postpone exposed high places and long stair climbs.'
    });
  }
  if (heavy) {
    risks.push({
      icon: '🌧️',
      si: 'ප්‍රබල වැසි. පහත් බිම් සහ ලිස්සන සුළු ගල් පඩි වළකින්න; දිගු එළිමහන් නැරඹීම් සුදුසු නොවේ.',
      en: 'Heavy rain. Avoid low-lying ground and slippery stone steps; long outdoor visits are not advised.'
    });
  }
  if ((gust ?? 0) >= 50 || (wind ?? 0) >= 50) {
    risks.push({
      icon: '💨',
      si: 'ප්‍රබල සුළං. වෙළඳ දැන්වීම් පුවරු, තාවකාලික වියන් සහ විශාල ගස්වලින් ඈත් වන්න.',
      en: 'Strong wind. Stay clear of signboards, temporary canopies and large trees.'
    });
  }
  if ((feels ?? 0) >= 40 || (max ?? 0) >= 40) {
    risks.push({
      icon: '🥵',
      si: 'දැඩි උණුසුම. දහවල් එළිමහන් කාලය සීමා කර නිතර ජලය පානය කරන්න.',
      en: 'Extreme heat. Limit time outdoors around midday and drink water often.'
    });
  }
  if ((uv ?? 0) >= 11) {
    risks.push({
      icon: '🌞',
      si: 'හිරු රශ්මිය අතිශය ප්‍රබලයි. දහවල් විවෘත ටැරසවල දිගු වේලාවක් නොසිටින්න.',
      en: 'Extreme UV. Do not stay long on open terraces around midday.'
    });
  }
  if (profile.coastal && (gust ?? 0) >= 40) {
    risks.push({
      icon: '🌊',
      si: 'රළ සහ සුළඟ ප්‍රබලයි. මුහුදු වෙරළේ ගල් පරවලින් ඈත් වන්න.',
      en: 'Strong surf and wind. Keep away from rocks and the waterline.'
    });
  }

  /* --- 出行穿搭 --- */
  if (swing !== null && swing > 8) {
    dress.push({
      icon: '🧥',
      si: `දිවා හා රාත්‍රී උෂ්ණත්ව වෙනස ${formatNumber(swing)}°C පමණ — සැහැල්ලු ජැකට් එකක් රැගෙන එන්න.`,
      en: `The day–night swing is about ${formatNumber(swing)}°C — bring a light jacket.`
    });
  }
  if (max !== null && max >= 32) {
    dress.push({
      icon: '👕',
      si: 'උෂ්ණත්වය ඉහළයි — සැහැල්ලු, වාතය ගමන් කරන ලා පැහැති ඇඳුම් තෝරන්න.',
      en: 'Hot day — choose light, breathable, light-coloured clothing.'
    });
  }
  if (max !== null && max <= 10) {
    dress.push({
      icon: '🧣',
      si: 'උෂ්ණත්වය අඩුයි — උණුසුම් ඇඳුම් ස්තර සහ ලොම් ඇඳුමක් රැගෙන එන්න.',
      en: 'Cold day — pack warm layers and a warm outer layer.'
    });
  }
  if (wetGround) {
    dress.push({
      icon: '👟',
      si: 'වැසි ඇති විය හැක — ජලයට ඔරොත්තු දෙන, පහසුවෙන් වියළෙන සපත්තු තෝරන්න.',
      en: 'Rain is possible — choose water-resistant, quick-drying footwear.'
    });
  }
  if (profile.barefootGround) {
    dress.push({
      icon: '🩴',
      si: 'පූජනීය පරිශ්‍රයේ පාවහන් ඉවත් කළ යුතුයි — පහසුවෙන් ඉවත් කළ හැකි සපත්තු තෝරන්න.',
      en: 'Footwear is removed at the precinct — wear shoes you can slip off easily.'
    });
  }
  if ((wind ?? 0) >= 29 && (wind ?? 0) < 50) {
    dress.push({
      icon: '🧢',
      si: 'සුළඟ ප්‍රබලයි — ලිහිල් දිගු ඇඳුම් සහ පහසුවෙන් පියාඹන තොප්පි වළකින්න.',
      en: 'Windy — avoid loose flowing clothing and hats that blow off easily.'
    });
  }
  if (profile.mountain && max !== null && max >= 30) {
    dress.push({
      icon: '🥾',
      si: 'උස් ස්ථාන (මිහින්තලේ පියගැට) වඩාත් සිසිල් විය හැක — අතිරේක ස්තරයක් සහ ස්ථිර පාවහන් රැගෙන යන්න.',
      en: 'Higher ground such as the Mihintale stairway is cooler — carry an extra layer and sturdy shoes.'
    });
  }

  /* --- 游玩安排 --- */
  if (thunder || heavy) {
    plan.push({
      icon: '🏛️',
      si: 'එළිමහන් නැරඹීම් සීමා කර, ආවරණය සහිත මාර්ග හා ගෘහස්ථ කෞතුකාගාර වැනි ස්ථානවලට ප්‍රමුඛතාව දෙන්න.',
      en: 'Limit outdoor time and prioritise covered walkways and indoor museums.'
    });
  }
  if (lightRain) {
    plan.push({
      icon: '🚶',
      si: 'සැහැල්ලු වැසි — ගල් පඩි සහ බිම් ලිස්සන සුළු විය හැක; වේගය අඩු කරන්න.',
      en: 'Light rain — stone steps and floors can be slippery; slow down.'
    });
  }
  if ((rainChance ?? 0) >= 60) {
    plan.push({
      icon: '☔',
      si: 'වැසි ඇතිවීමේ ඉඩ වැඩියි — එළිමහන් සැලසුම් නම්‍යශීලීව තබා ගන්න.',
      en: 'Rain is likely — keep outdoor plans flexible.'
    });
  }
  if (profile.mountain && (thunder || heavy)) {
    plan.push({
      icon: '⛰️',
      si: 'මිහින්තලේ පියගැට තරණය වැනි උස් ස්ථාන ගමන් කල් දමන්න.',
      en: 'Postpone climbs such as the Mihintale stairway.'
    });
  }
  if (isClear(code)) {
    plan.push({
      icon: '🌤️',
      si: 'පැහැදිලි දවසකි — එළිමහන් නැරඹීමට සුදුසුයි; අලුයම සහ සන්ධ්‍යාව වඩාත් හොඳයි.',
      en: 'Clear day — good for outdoor visiting, especially at dawn and dusk.'
    });
  }
  if (isCloudy(code)) {
    plan.push({
      icon: '📷',
      si: 'හිරු රශ්මිය මෘදුයි — දිගු ඇවිදීම් සහ ඡායාරූප සඳහා හිතකරයි.',
      en: 'Soft light — comfortable for long walks and photography.'
    });
  }
  if (isFog(code)) {
    plan.push({
      icon: '🌫️',
      si: 'දෘශ්‍යතාව අඩුයි — දුර දර්ශන සහ සන්ධ්‍යා ඡායාරූප සඳහා සුදුසු නොවේ.',
      en: 'Low visibility — not ideal for distant views or sunset photography.'
    });
  }
  if (max !== null && max >= 32) {
    plan.push({
      icon: '🕐',
      si: 'දහවල් 11:00–15:00 අතර දිගු ඇවිදීම් වළක්වා අලුයම හෝ සවසට සැලසුම් කරන්න.',
      en: 'Avoid long walks between 11:00 and 15:00; plan for dawn or late afternoon.'
    });
  }
  if ((uv ?? 0) >= 5) {
    plan.push({
      icon: '🌞',
      si: 'හිරු රශ්මිය ප්‍රබලයි — සෙවන සහිත මාර්ග තෝරා නිතර විවේක ගන්න.',
      en: 'Strong sun — pick shaded routes and rest often.'
    });
  }
  if ((wind ?? 0) >= 29 && (wind ?? 0) < 50) {
    plan.push({
      icon: '🏯',
      si: 'උස් වේදිකා සහ විවෘත ටැරසවල සුළඟ දැඩිව දැනේ.',
      en: 'Wind feels stronger on open terraces and upper platforms.'
    });
  }
  if (profile.waterside && ((rainChance ?? 0) >= 40 || (humidity ?? 0) >= 75)) {
    plan.push({
      icon: '🦟',
      si: 'වැව් ආශ්‍රිතව මදුරුවන් වැඩි විය හැක — සන්ධ්‍යාවේ ප්‍රවේශම් වන්න.',
      en: 'Mosquitoes increase near the tanks — take extra care at dusk.'
    });
  }
  if (profile.coastal) {
    plan.push({
      icon: '🏖️',
      si: 'මුහුදු ස්නානය සඳහා රළ සහ වැලි තත්ත්වය පරීක්ෂා කරන්න.',
      en: 'Check surf and sand conditions before entering the water.'
    });
  }

  /* --- 随身物品 --- */
  if (heavy || thunder) {
    carry.push({
      icon: '🧥',
      si: 'වැසි කබායක් — සුළඟේ දිගු මිටි කුඩය අපහසුයි.',
      en: 'A raincoat — a long umbrella is awkward in wind.'
    });
  } else if ((rainChance ?? 0) >= 60 || lightRain) {
    carry.push({
      icon: '☂️',
      si: 'නැමිය හැකි කුඩය.',
      en: 'A folding umbrella.'
    });
  }
  if ((uv ?? 0) >= 5) {
    carry.push({
      icon: '🧴',
      si: 'හිරු ආවරණ ක්‍රීම්, අව් කණ්ණාඩි සහ තොප්පිය.',
      en: 'Sunscreen, sunglasses and a hat.'
    });
  }
  if ((max ?? 0) >= 32 || (feels ?? 0) >= 34) {
    carry.push({
      icon: '💧',
      si: 'ප්‍රමාණවත් පානීය ජලය (අවම වශයෙන් ලීටර් 1–2).',
      en: 'Plenty of drinking water (at least 1–2 litres).'
    });
  }
  if (swing !== null && swing > 8) {
    carry.push({
      icon: '🧥',
      si: 'සැහැල්ලු ජැකට් එකක් හෝ ස්වීටරයක්.',
      en: 'A light jacket or sweater.'
    });
  }
  if (profile.barefootGround && ((max ?? 0) >= 33 || (feels ?? 0) >= 34)) {
    carry.push({
      icon: '🧦',
      si: 'මේස් යුගලයක් — පාවහන් ඉවත් කළ පසු බිම උණුසුම් විය හැක.',
      en: 'A pair of socks — the ground can be hot once shoes come off.'
    });
  }
  if (profile.waterside && ((rainChance ?? 0) >= 40 || (humidity ?? 0) >= 75 || (rainSum ?? 0) > 0)) {
    carry.push({
      icon: '🦟',
      si: 'මදුරු විකර්ෂක.',
      en: 'Insect repellent.'
    });
  }
  if (isFog(code)) {
    carry.push({
      icon: '😷',
      si: 'මුඛ ආවරණයක්.',
      en: 'A face mask.'
    });
  }
  if ((wind ?? 0) >= 29 && (wind ?? 0) < 50) {
    carry.push({
      icon: '🧢',
      si: 'තොප්පිය සුරක්ෂිත කිරීමට ක්ලිප් එකක් හෝ පටියක්.',
      en: 'A clip or strap to keep your hat on.'
    });
  }

  const headline = {
    si: `${text.si} · ${formatNumber(min)}°–${formatNumber(max)}° · හිරු රශ්මිය ${uvWord.si} · ${windWord.si}`,
    en: `${text.en} · ${formatNumber(min)}°–${formatNumber(max)}°C · UV ${uvWord.en} · ${windWord.en}`
  };

  return { headline, risks, dress, plan, carry };
}

interface RawWeatherPayload {
  timezone?: string;
  current?: Record<string, number | string | null>;
  daily?: Record<string, (number | string | null)[] | undefined>;
}

/** Convert a raw provider payload into the shape used across the site. */
export function normaliseWeatherPayload(payload: unknown, fetchedAt: string): WeatherSnapshot | null {
  const raw = (payload ?? {}) as RawWeatherPayload;
  const current = raw.current ?? {};
  const daily = raw.daily ?? {};
  const dates = (daily.time ?? []) as string[];
  const num = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

  const now: WeatherNow = {
    time: typeof current.time === 'string' ? current.time : fetchedAt,
    temperature: num(current.temperature_2m),
    apparentTemperature: num(current.apparent_temperature),
    humidity: num(current.relative_humidity_2m),
    precipitation: num(current.precipitation),
    windSpeed: num(current.wind_speed_10m),
    windGusts: num(current.wind_gusts_10m),
    uvIndex: num(current.uv_index),
    weatherCode: num(current.weather_code),
    isDay: current.is_day !== 0
  };

  const days: WeatherDay[] = dates.slice(0, 7).map((date, index) => ({
    date,
    weatherCode: num((daily.weather_code as number[] | undefined)?.[index]),
    tempMax: num((daily.temperature_2m_max as number[] | undefined)?.[index]),
    tempMin: num((daily.temperature_2m_min as number[] | undefined)?.[index]),
    precipitation: num((daily.precipitation_sum as number[] | undefined)?.[index]),
    precipitationProbability: num((daily.precipitation_probability_max as number[] | undefined)?.[index]),
    uvIndexMax: num((daily.uv_index_max as number[] | undefined)?.[index]),
    windSpeedMax: num((daily.wind_speed_10m_max as number[] | undefined)?.[index]),
    windGustsMax: num((daily.wind_gusts_10m_max as number[] | undefined)?.[index])
  }));

  if (!days.length && now.temperature === null) return null;

  return {
    ok: true,
    fetchedAt,
    timezone: raw.timezone ?? 'Asia/Colombo',
    now,
    days
  };
}
