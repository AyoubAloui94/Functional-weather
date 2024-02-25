import { useCallback, useEffect, useState } from "react"
import { convertToFlag } from "./helpers/convertToFlag"
import { formatDay } from "./helpers/formatDate"
import { getWeatherIconDay, getWeatherIconNight } from "./helpers/getWeatherIcon"
import { getWeatherStatus } from "./helpers/getWeatherStatus"
import { getWindDirection, getWindDirectionArrow } from "./helpers/getWind"

export default function App() {
  const [location, setLocation] = useState(function () {
    return localStorage.getItem("location") || ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [displayLocation, setDisplayLocation] = useState("")
  const [dailyWeather, setDailyWeather] = useState({})
  const [currentWeather, setCurrentWeather] = useState({})
  const [hourlyWeather, setHourlyWeather] = useState({})
  const [aqi, setAqi] = useState("")
  const [timezone, setTimezone] = useState("")

  function handleLocation() {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`)
        const data = await res.json()
        if (!data) throw new Error("Something went wrong, please try again later.")
        setLocation(data.features.at(0).properties.city)
      } catch (error) {
        console.log(error.message)
      }
    })
  }

  const reset = useCallback(function () {
    setDailyWeather({})
    setCurrentWeather({})
    setHourlyWeather({})
  }, [])

  const fetchWeather = useCallback(
    async function fetchWeather(controller) {
      if (location.length < 2) return reset()
      try {
        setIsLoading(true)
        // 1) Getting location (geocoding)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`, { signal: controller.signal })
        const geoData = await geoRes.json()

        if (!geoData.results) throw new Error("Location not found")

        const { latitude, longitude, timezone, name, country_code } = geoData.results.at(0)
        setDisplayLocation(`${name === "Revel" ? "Tallinn" : name} ${convertToFlag(country_code)}`)
        setTimezone(timezone)
        // 2) Getting actual weather
        const currentQuery = "temperature_2m,apparent_temperature,relativehumidity_2m,precipitation,rain,showers,snow_depth,weathercode,pressure_msl,windspeed_10m,winddirection_10m,winddirection_10m,precipitation_probability,uv_index,visibility,is_day,windspeed_20m"
        const hourlyQuery = "temperature_2m,weathercode,windspeed_10m,is_day,windspeed_20m"
        const DailyQuery = "weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant"
        const forecastDays = window.screen.width <= 480 ? 15 : 14

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=${DailyQuery}&current=${currentQuery}&hourly=${hourlyQuery}&forecast_days=${forecastDays}`)
        const weatherData = await weatherRes.json()
        if (weatherData.error) throw new Error("Invalid location")
        const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi`)
        const aqiData = await aqiRes.json()
        setDailyWeather(weatherData.daily)
        setCurrentWeather(weatherData.current)
        setHourlyWeather(weatherData.hourly)
        // console.log(weatherData)
        setAqi(aqiData.current)
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
    },
    [location, reset]
  )

  useEffect(
    function () {
      const controller = new AbortController()
      fetchWeather(controller)
      localStorage.setItem("location", location)

      return () => controller.abort()
    },
    [fetchWeather, location]
  )

  return (
    <>
      {/* <Clock /> */}
      <div className="app">
        <h1>
          <span>🌤️</span>Weather Calendar
        </h1>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Search for location" />
        <button onClick={handleLocation} className="btn">
          <span>
            <img className="location-icon" src="/location-icon.png" alt="location-icon" />
          </span>
          My location
        </button>
        {isLoading && <Loader />}
        <div>
          {dailyWeather.weathercode?.length && location.length >= 2 && (
            <>
              <h2>{displayLocation}</h2>
              <Clock timezone={timezone} />
              <Today weather={currentWeather} aqi={aqi} max={dailyWeather.temperature_2m_max[0]} min={dailyWeather.temperature_2m_min[0]} />
              <HourlyWeather weather={hourlyWeather} timezone={timezone} />
              <DailyWeather weather={dailyWeather} />
            </>
          )}
        </div>
      </div>
    </>
  )
}

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

function HourlyWeather({ weather, timezone }) {
  const { weathercode, time, temperature_2m, windspeed_10m, is_day } = weather

  const index = time.findIndex(hour => new Date(new Date().toLocaleString(navigator.languages[0], { timeZone: timezone })) < new Date(new Date(hour).toLocaleString(navigator.languages[0])))

  const hours = time.slice(index - 1, index + 23)
  const codes = weathercode.slice(index - 1, index + 23)
  const temperatures = temperature_2m.slice(index - 1, index + 23)
  const windSpeeds = windspeed_10m.slice(index - 1, index + 23)
  const isDay = is_day.slice(index - 1, index + 23)

  return (
    <>
      <h3>24-hour forecast</h3>
      <div className="container">
        <div className="hourly">
          {hours.map((hour, i) => (
            <Hour key={hour} hour={hour} code={codes.at(i)} temperature={temperatures.at(i)} windSpeed={windSpeeds.at(i)} isNow={i === 0} isDay={isDay.at(i)} />
          ))}
        </div>
      </div>
    </>
  )
}

function Hour({ hour, code, temperature, windSpeed, isNow, isDay }) {
  const timeDisplay = isNow ? "Now" : new Date(hour).toTimeString().slice(0, 5) !== "00:00" ? new Date(hour).toLocaleTimeString(navigator.languages[0], { hour: "numeric", minute: "numeric" }) : new Date(hour).toLocaleDateString(navigator.languages[0], { month: "2-digit", day: "2-digit" })

  return (
    <li className="hour">
      <span>{isDay === 1 ? <img src={getWeatherIconDay(code)} alt={code} /> : <img src={getWeatherIconNight(code)} alt={code} />}</span>
      <p>{Math.round(temperature)}&deg;</p>
      <p>{windSpeed} km/h</p>
      <p>{timeDisplay}</p>
    </li>
  )
}

function DailyWeather({ weather }) {
  const { weathercode: codes, time: dates, temperature_2m_max: max, temperature_2m_min: min, precipitation_probability_max: rain, windspeed_10m_max: windSpeed, winddirection_10m_dominant: windDirection } = weather
  return (
    <>
      <h3>{window.screen.width <= 480 ? "15-day forecast" : "14-day forecast"}</h3>
      <div className="weather">
        {dates.map((date, i) => (
          <Day max={max.at(i)} key={date} min={min.at(i)} date={date} code={codes.at(i)} isToday={i === 0} rain={rain.at(i)} windSpeed={windSpeed.at(i)} windDirection={windDirection.at(i)} />
        ))}
      </div>
    </>
  )
}

function Day({ date, max, min, code, isToday, rain, windSpeed, windDirection }) {
  return (
    <li className="day">
      <span className="weather-icon">
        <img src={getWeatherIconDay(code)} alt={code} />
      </span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        {Math.round(min)}&deg; &mdash; <strong>{Math.round(max)}&deg;</strong>
      </p>
      <p>
        <span className="wind-direction">{getWindDirectionArrow(windDirection)}</span> {windSpeed} km/h
      </p>
      <p>
        {(min + max) / 2 < 0 ? "Snow" : "Rain"}: {rain !== null ? `${rain}%` : "--"}
      </p>
    </li>
  )
}

function Loader() {
  return (
    <div className="spinnerContainer">
      <div className="spinner"></div>
    </div>
  )
}

function Clock({ timezone }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString(navigator.languages[0], { timeZone: timezone }))

  useEffect(
    function () {
      const intervalId = setInterval(() => setTime(new Date().toLocaleTimeString(navigator.languages[0], { timeZone: timezone })), 1000)
      return () => clearInterval(intervalId)
    },
    [time, timezone]
  )
  return <div className="clock">Local time: {time}</div>
}
