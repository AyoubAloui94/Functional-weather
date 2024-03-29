import { formatDay } from "../helpers/formatDate"
import { getWeatherIconDay } from "../helpers/getWeatherIcon"
import { getWindDirectionArrow } from "../helpers/getWind"

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

export default Day
