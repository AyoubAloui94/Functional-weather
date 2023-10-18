import { useCallback, useEffect, useState } from "react"

function getWindDirection(direction) {
  const windDirections = new Map([
    [[-11.25, 11.25], "N"],
    [[11.25, 33.75], "NNE"],
    [[33.75, 56.25], "NE"],
    [[56.25, 78.75], "ENE"],
    [[78.75, 101.25], "E"],
    [[101.25, 123.75], "ESE"],
    [[123.75, 146.25], "SE"],
    [[146.25, 168.75], "SSE"],
    [[168.75, 191.25], "S"],
    [[191.25, 213.75], "SSW"],
    [[213.75, 236.25], "SW"],
    [[236.25, 258.75], "WSW"],
    [[258.75, 281.25], "W"],
    [[281.25, 303.75], "WNW"],
    [[303.75, 326.25], "NW"],
    [[326.25, 348.75], "NNW"]
  ])

  const modulatedDirection = direction <= 348.75 ? direction : direction - 360

  const arr = [...windDirections.keys()].find(key => key[0] <= modulatedDirection && modulatedDirection <= key[1])
  if (!arr) return "NOT FOUND"
  return windDirections.get(arr)
}

function getWindDirectionArrow(direction) {
  const windDirections = new Map([
    [[-11.25, 11.25], "\u2193"],
    [[11.25, 78.75], "\u2199"],
    [[78.75, 101.25], "\u2190"],
    [[101.25, 168.75], "\u2196"],
    [[168.75, 191.25], "\u2191"],
    [[191.25, 258.75], "\u2197"],
    [[258.75, 281.25], "\u2192"],
    [[281.25, 348.75], "\u2198"]
  ])

  const modulatedDirection = direction <= 348.75 ? direction : direction - 360

  const arr = [...windDirections.keys()].find(key => key[0] <= modulatedDirection && modulatedDirection <= key[1])
  if (!arr) return "NOT FOUND"
  return windDirections.get(arr)
}

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"]
  ])
  const arr = [...icons.keys()].find(key => key.includes(wmoCode))
  if (!arr) return "NOT FOUND"
  return icons.get(arr)
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(new Date(dateStr))
}

export default function App() {
  const [location, setLocation] = useState(function () {
    return localStorage.getItem("location") || ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [displayLocation, setDisplayLocation] = useState("")
  const [dailyWeather, setDailyWeather] = useState({})
  const [currentWeather, setCurrentWeather] = useState({})
  const [hourlyWeather, setHourlyWeather] = useState({})

  function handleLocation() {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&apiKey=0adca2d9af08410eb2ed71dda2243bb4`)
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
    async function fetchWeather() {
      if (location.length < 2) return reset()
      try {
        setIsLoading(true)
        // 1) Getting location (geocoding)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`)
        const geoData = await geoRes.json()

        if (!geoData.results) throw new Error("Location not found")

        const { latitude, longitude, timezone, name, country_code } = geoData.results.at(0)
        setDisplayLocation(`${name} ${convertToFlag(country_code)}`)

        // 2) Getting actual weather
        const currentQuery = "temperature_2m,apparent_temperature,relativehumidity_2m,precipitation,rain,showers,weathercode,pressure_msl,windspeed_10m,winddirection_10m,winddirection_10m,precipitation_probability,uv_index"
        const hourlyQuery = "temperature_2m,weathercode,windspeed_10m"
        const DailyQuery = "weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max,windspeed_10m_max,winddirection_10m_dominant"
        const forecastDays = window.screen.width <= 480 ? 15 : 14

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=${DailyQuery}&current=${currentQuery}&hourly=${hourlyQuery}&forecast_days=${forecastDays}`)
        const weatherData = await weatherRes.json()
        // console.log(weatherData.hourly)
        setDailyWeather(weatherData.daily)
        setCurrentWeather(weatherData.current)
        setHourlyWeather(weatherData.hourly)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
    [location, reset]
  )

  useEffect(
    function () {
      fetchWeather()
      localStorage.setItem("location", location)
    },
    [fetchWeather, location]
  )

  return (
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
        {dailyWeather.weathercode?.length && (
          <>
            <h2>{displayLocation}</h2>
            <Today weather={currentWeather} />
            <HourlyWeather weather={hourlyWeather} />
            <DailyWeather weather={dailyWeather} />
          </>
        )}
      </div>
    </div>
  )
}

function Today({ weather }) {
  const { weathercode, relativehumidity_2m: humidity, temperature_2m: temperature, windspeed_10m: windSpeed, pressure_msl: pressure, winddirection_10m: windDirection, precipitation_probability: chanceOfRain, uv_index: uvIndex, apparent_temperature: realFeel } = weather

  return (
    <div className="today">
      <p>Now</p>
      <span className="weather-icon">{getWeatherIcon(weathercode)}</span>

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
        </div>
        <div className="today--params">
          <p className="param">
            <span>Pressure</span>
            <span className="param--value">{Math.round(pressure)} mbar</span>
          </p>
          <p className="param">
            <span>Chance of rain</span>
            <span className="param--value">{chanceOfRain}%</span>
          </p>
          <p className="param">
            <span>UV index</span>
            <span className="param--value">{Math.round(uvIndex)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function HourlyWeather({ weather }) {
  const { weathercode, time, temperature_2m, windspeed_10m } = weather

  const index = time.findIndex(hour => new Date().toISOString() < new Date(hour).toISOString())
  const hours = time.slice(index - 1, index + 23)
  const codes = weathercode.slice(index - 1, index + 23)
  const temperatures = temperature_2m.slice(index - 1, index + 23)
  const windSpeeds = windspeed_10m.slice(index - 1, index + 23)

  return (
    <>
      <h3>24-hour forecast</h3>
      <div className="container">
        <div className="hourly">
          {hours.map((hour, i) => (
            <Hour key={hour} hour={hour} code={codes.at(i)} temperature={temperatures.at(i)} windSpeed={windSpeeds.at(i)} isNow={i === 0} />
          ))}
        </div>
      </div>
    </>
  )
}

function Hour({ hour, code, temperature, windSpeed, isNow }) {
  const timeDisplay = isNow ? "Now" : new Date(hour).toTimeString().slice(0, 5) !== "00:00" ? new Date(hour).toTimeString().slice(0, 5) : new Date(hour).toLocaleDateString("fr-FR").slice(0, 5)

  return (
    <li className="hour">
      <span>{getWeatherIcon(code)}</span>
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
      <span className="weather-icon">{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        {Math.round(min)}&deg; &mdash; <strong>{Math.round(max)}&deg;</strong>
      </p>
      <p>
        <span className="wind-direction">{getWindDirectionArrow(windDirection)}</span> {windSpeed} km/h
      </p>
      <p>Rain: {rain !== null ? `${rain}%` : "--"}</p>
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
