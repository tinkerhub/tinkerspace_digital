// Tinkerspace coordinates
const DEFAULT_LAT = 10.0469797;
const DEFAULT_LONG = 76.3351998;

export async function getCurrentWeather() {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LONG}&current=temperature_2m,precipitation,weather_code&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();
    
    //Uncomment the below code to test the rain animation

    // const response = {
    //   "latitude": 10,
    //   "longitude": 76.375,
    //   "generationtime_ms": 0.0363588333129883,
    //   "utc_offset_seconds": 19800,
    //   "timezone": "Asia/Kolkata",
    //   "timezone_abbreviation": "GMT+5:30",
    //   "elevation": 9,
    //   "current_units": {
    //     "time": "iso8601",
    //     "interval": "seconds",
    //     "temperature_2m": "°C",
    //     "precipitation": "mm",
    //     "weather_code": "wmo code"
    //   },
    //   "current": {
    //     "time": "2025-04-29T21:45",
    //     "interval": 900,
    //     "temperature_2m": 16.2,
    //     "precipitation": 120,
    //     "weather_code": 65
    //   }
    // }
    // const data = response;
    
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
      temperature: Math.round(data.current.temperature_2m),
      precipitation: data.current.precipitation
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
} 