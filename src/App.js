import { useCallback, useEffect, useState } from "react"

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
  return new Intl.DateTimeFormat("en", {
    weekday: "short"
  }).format(new Date(dateStr))
}

export default function App() {
  const [location, setLocation] = useState(function () {
    return localStorage.getItem("location") || ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [displayLocation, setDisplayLocation] = useState("")
  const [weather, setWeather] = useState({})

  const callback = useCallback(
    async function fetchWeather() {
      if (location.length < 2) return setWeather({})
      try {
        setIsLoading(true)
        // 1) Getting location (geocoding)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`)
        const geoData = await geoRes.json()

        if (!geoData.results) throw new Error("Location not found")

        const { latitude, longitude, timezone, name, country_code } = geoData.results.at(0)
        setDisplayLocation(`${name} ${convertToFlag(country_code)}`)

        // 2) Getting actual weather
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`)
        const weatherData = await weatherRes.json()
        setWeather(weatherData.daily)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
    [location]
  )

  useEffect(
    function () {
      callback()
      localStorage.setItem("location", location)
    },
    [callback, location]
  )

  return (
    <div className="app">
      <h1>
        <span>🌤️</span>Functional Weather
      </h1>
      <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Search for location" />
      {/* <button onClick={callback}>Get weather</button> */}
      {isLoading && <p className="loader">Loading...</p>}
      {weather.weathercode?.length && <Weather displayLocation={displayLocation} weather={weather} />}
    </div>
  )
}

function Weather({ displayLocation, weather }) {
  const { weathercode: codes, time: dates, temperature_2m_max: max, temperature_2m_min: min } = weather
  return (
    <div>
      <h2>{displayLocation}</h2>
      <ul className="weather">
        {dates.map((date, i) => (
          <Day max={max.at(i)} key={date} min={min.at(i)} date={date} code={codes.at(i)} isToday={i === 0} />
        ))}
      </ul>
    </div>
  )
}

function Day({ date, max, min, code, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        {Math.round(min)}&deg; &mdash; <strong>{Math.round(max)}&deg;</strong>
      </p>
    </li>
  )
}
