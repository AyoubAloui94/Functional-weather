function getWeatherStatus(wmoCode) {
  const icons = new Map([
    [[0], "Clear"],
    [[1], "Partly cloudy"],
    [[2], "Mostly cloudy"],
    [[3], "Cloudy"],
    [[45, 48], "Fog"],
    [[51, 56, 61, 66, 80], "Showers"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "Rain"],
    [[71, 73, 75, 77, 85, 86], "Snow"],
    [[95], "Thunderstorm"],
    [[96, 99], "Thunderstorm & Rain"]
  ])
  const arr = [...icons.keys()].find(key => key.includes(wmoCode))
  if (!arr) return "NOT FOUND"
  return icons.get(arr)
}

export { getWeatherStatus }
