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

function getWeatherIconDay(wmoCode) {
  const icons = new Map([
    [[0], "/imgs/day_clear.png"],
    [[1], "/imgs/day_partial_cloud.png"],
    [[2], "/imgs/day_partial_cloud.png"],
    [[3], "/imgs/cloudy.png"],
    [[45, 48], "/imgs/fog.png"],
    [[51, 56, 61, 66, 80], "/imgs/day_rain.png"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "/imgs/rain.png"],
    [[71, 73, 75, 77, 85, 86], "/imgs/snow.png"],
    [[95], "/imgs/thunder.png"],
    [[96, 99], "/imgs/rain_thunder.png"]
  ])
  const arr = [...icons.keys()].find(key => key.includes(wmoCode))
  if (!arr) return "NOT FOUND"
  return icons.get(arr)
}

function getWeatherIconNight(wmoCode) {
  const icons = new Map([
    [[0], "/imgs/night_half_moon_clear.png"],
    [[1], "/imgs/night_half_moon_partial_cloud.png"],
    [[2], "/imgs/night_half_moon_partial_cloud.png"],
    [[3], "/imgs/cloudy.png"],
    [[45, 48], "/imgs/fog.png"],
    [[51, 56, 61, 66, 80], "/imgs/night_half_moon_rain.png"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "/imgs/rain.png"],
    [[71, 73, 75, 77, 85, 86], "/imgs/snow.png"],
    [[95], "/imgs/thunder.png"],
    [[96, 99], "/imgs/rain_thunder.png"]
  ])
  const arr = [...icons.keys()].find(key => key.includes(wmoCode))
  if (!arr) return "NOT FOUND"
  return icons.get(arr)
}

export { getWeatherIcon, getWeatherIconDay, getWeatherIconNight }
