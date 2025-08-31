import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import GrainIcon from "@mui/icons-material/Grain"; 
import AcUnitIcon from "@mui/icons-material/AcUnit"; 
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import VisibilityIcon from "@mui/icons-material/Visibility"; 

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

interface DailyWeather {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

function App() {
  const [city, setCity] = useState("");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [daily, setDaily] = useState<DailyWeather | null>(null);

  const fetchWeather = async () => {
    try {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=de&format=json`
      );

      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        alert("Stadt nicht gefunden!");
        return;
      }

      const { latitude, longitude } = geoRes.data.results[0];

      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&forecast_days=5&timezone=Europe%2FBerlin`
      );

      setCurrent(weatherRes.data.current_weather);
      setDaily(weatherRes.data.daily);
    } catch (error) {
      console.error(error);
      alert("Fehler beim Abrufen der Wetterdaten");
    }
  };

  const getWeatherIcon = (code: number, size: "small" | "large" = "large") => {
    if (code === 0) return <WbSunnyIcon fontSize={size} color="warning" />;
    if (code >= 1 && code <= 3) return <CloudIcon fontSize={size} color="action" />;
    if (code >= 45 && code <= 48) return <VisibilityIcon fontSize={size} />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
      return <GrainIcon fontSize={size} color="primary" />;
    if (code >= 71 && code <= 77) return <AcUnitIcon fontSize={size} color="info" />;
    if (code >= 95) return <ThunderstormIcon fontSize={size} color="error" />;
    return <CloudIcon fontSize={size} />;
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" };
    return new Date(dateStr).toLocaleDateString("de-DE", options);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" gutterBottom>
        Wetter-App
      </Typography>

      <TextField
        label="Stadt in Deutschland"
        variant="outlined"
        fullWidth
        margin="normal"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <Button variant="contained" color="primary" onClick={fetchWeather}>
        Wetter anzeigen
      </Button>
    
      {current && (
        <Card style={{ marginTop: "20px", textAlign: "center" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {city}
            </Typography>
            <div>{getWeatherIcon(current.weathercode)}</div>
            <Typography>🌡️ Temperatur: {current.temperature} °C</Typography>
            <Typography>💨 Wind: {current.windspeed} km/h</Typography>
          </CardContent>
        </Card>
      )}

            {daily && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6" gutterBottom>
            5-Tage-Vorhersage
          </Typography>
          <Grid container spacing={2}>
            {daily.time.map((date, idx) => (
              <Grid item xs={6} sm={4} md={2} key={date}>
                <Card style={{ textAlign: "center" }}>
                  <CardContent>
                    <Typography variant="subtitle2">{formatDate(date)}</Typography>
                    {getWeatherIcon(daily.weathercode[idx], "small")}
                    <Typography variant="body2">
                      {daily.temperature_2m_min[idx]}° / {daily.temperature_2m_max[idx]}°
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </Container>
  );
}

export default App;