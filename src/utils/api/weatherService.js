// Tinkerspace coordinates
const DEFAULT_LAT = 10.0469797;
const DEFAULT_LONG = 76.3351998;
const REQUEST_TIMEOUT_MS = 10000;

export async function getCurrentWeather() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LONG}&current=temperature_2m,precipitation,weather_code&timezone=auto`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather data fetch failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.current || typeof data.current.weather_code === 'undefined') {
      throw new Error('Weather API returned unexpected structure.');
    }

    // WMO Weather interpretation codes
    // https://open-meteo.com/en/docs
    const weatherCode = data.current.weather_code;
    const isRaining = [
      51, 53, 55, // Drizzle
      61, 63, 65, // Rain
      80, 81, 82, // Rain showers
      95, 96, 99  // Thunderstorm
    ].includes(weatherCode);

    // Map weather codes to descriptions
    const getWeatherDescription = (code) => {
      if (code >= 95) return 'Thunderstorm';
      if (code >= 80) return 'Rain Showers';
      if (code >= 61) return 'Raining';
      if (code >= 51) return 'Drizzle';
      if (code >= 45) return 'Foggy';
      if (code >= 1) return 'Partly Cloudy';
      return 'clear sky';
    };

    return {
      isRaining,
      description: getWeatherDescription(weatherCode),
      temperature: Math.round(data.current.temperature_2m ?? 0),
      precipitation: data.current.precipitation ?? 0,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching weather:', error.message);
    return null;
  }
}
