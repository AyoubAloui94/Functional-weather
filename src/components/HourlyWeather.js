import Hour from "./Hour"

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

export default HourlyWeather
