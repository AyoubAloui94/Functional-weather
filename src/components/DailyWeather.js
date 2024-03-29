import Day from "./Day"

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

export default DailyWeather
