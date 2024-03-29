import { getWeatherIconDay, getWeatherIconNight } from "../helpers/getWeatherIcon"
import { getWeatherStatus } from "../helpers/getWeatherStatus"
import { getWindDirection } from "../helpers/getWind"

function Today({ weather, aqi, max, min }) {
  const { weathercode, relativehumidity_2m: humidity, temperature_2m: temperature, windspeed_10m: windSpeed, pressure_msl: pressure, winddirection_10m: windDirection, precipitation_probability: chanceOfRain, uv_index: uvIndex, apparent_temperature: realFeel, visibility, rain, showers, snow_depth, is_day: isDay } = weather
  const { european_aqi } = aqi

  return (
    <div className="today">
      <div className="status-container">
        <span className="now">Now</span>
        <span className="weather-icon--today">{isDay === 1 ? <img src={getWeatherIconDay(weathercode)} alt={weathercode} /> : <img src={getWeatherIconNight(weathercode)} alt={weathercode} />}</span>
        <div className="current-status">
          <p>{getWeatherStatus(weathercode)}</p>{" "}
          <p>
            {Math.ceil(max)}&deg;/{Math.floor(min)}&deg;
          </p>
        </div>
      </div>
      <div className="params-container">
        <div className="today--params">
          <p className="param">
            <span>Temperature</span>
            <span className="param--value">{Math.round(temperature)}&deg;</span>
          </p>
          <p className="param">
            <span>Humidity</span>
            <span className="param--value">{humidity}%</span>
          </p>
          <p className="param">
            <span>Real feel</span>
            <span className="param--value">{Math.round(realFeel)}&deg;</span>
          </p>
          <p className="param">
            <span>Wind</span>
            <span className="param--value">
              {getWindDirection(windDirection)} {windSpeed} km/h
            </span>
          </p>
          <p className="param">
            <span>Visibility</span>
            <span className="param--value">{visibility >= 1000 ? `${Math.round(visibility / 1000)} km` : `${visibility} m`}</span>
          </p>
        </div>
        <div className="today--params">
          <p className="param">
            <span>Pressure</span>
            <span className="param--value">{Math.round(pressure)} mbar</span>
          </p>
          <p className="param">
            <span>{temperature < 0 ? "Chance of snow" : "Chance of rain"}</span>
            <span className="param--value">{chanceOfRain}%</span>
          </p>
          <p className="param">
            <span>UV index</span>
            <span className="param--value">{Math.round(uvIndex)}</span>
          </p>
          {snow_depth > 0 && (
            <p className="param">
              <span>Snow Depth</span>
              <span className="param--value">{Math.round(snow_depth * 100)} cm</span>
            </p>
          )}
          {showers > 0 && (
            <p className="param">
              <span>Showers</span>
              <span className="param--value">{showers} mm</span>
            </p>
          )}
          {rain > 0 && (
            <p className="param">
              <span>Rain</span>
              <span className="param--value">{rain} mm</span>
            </p>
          )}
          <p className="param">
            <span>AQI</span>
            <span className="param--value">{european_aqi}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Today
