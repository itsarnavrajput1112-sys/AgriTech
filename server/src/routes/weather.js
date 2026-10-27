import { Router } from 'express';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.get('/', async (req, res) => {
  const city = String(req.query.city || '').trim();
  if (!city) return res.status(400).json({ message: 'Enter a city name.' });
  if (!process.env.OPENWEATHER_API_KEY) {
    return res.status(503).json({ message: 'Weather is not configured yet. Add OPENWEATHER_API_KEY to server/.env.' });
  }
  try {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.searchParams.set('q', city);
    url.searchParams.set('appid', process.env.OPENWEATHER_API_KEY);
    url.searchParams.set('units', 'metric');
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ message: data.message || 'Could not fetch weather.' });
    res.json({ city: data.name, country: data.sys?.country, temperature: data.main?.temp, feelsLike: data.main?.feels_like, humidity: data.main?.humidity, description: data.weather?.[0]?.description, windSpeed: data.wind?.speed });
  } catch {
    res.status(502).json({ message: 'Weather service could not be reached.' });
  }
});
export default router;
