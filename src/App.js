import { useCallback, useEffect, useState } from "react"
import { convertToFlag } from "./helpers/convertToFlag"
import Today from "./components/Today"
import HourlyWeather from "./components/HourlyWeather"
import DailyWeather from "./components/DailyWeather"
import Loader from "./components/Loader"
import Clock from "./components/Clock"

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
