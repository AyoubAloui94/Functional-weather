import { getWeatherIconDay, getWeatherIconNight } from "../helpers/getWeatherIcon"

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

export default Hour
