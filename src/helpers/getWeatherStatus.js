function getWeatherStatus(wmoCode) {
  const icons = new Map([
    [[0], "Clear"],
    [[1], "Partly cloudy"],
    [[2], "Mostly cloudy"],
    [[3], "Cloudy"],
    [[45, 48], "Fog"],
    [[51], "Light drizzle"],
    [[53], "Drizzle"],
    [[55], "Heavy drizzle"],
    [[56, 57], "Freezing drizzle"],
    [[66, 67], "Freezing rain"],
    [[61], "Light rain"],
    [[63], "Rain"],
    [[65], "Heavy rain"],
    [[80], "Light showers"],
    [[81], "Showers"],
    [[82], "Violent showers"],
    [[71], "Light snow"],
    [[73], "Snow"],
    [[75], "Heavy snow"],
    [[85], "Light snow showers"],
    [[86], "Heavy snow showers"],
    [[77], "Snow grains"],
    [[95], "Thunderstorm"],
    [[96, 99], "Thunderstorm & Rain"]
  ])
  const arr = [...icons.keys()].find(key => key.includes(wmoCode))
  if (!arr) return "NOT FOUND"
  return icons.get(arr)
}

export { getWeatherStatus }
