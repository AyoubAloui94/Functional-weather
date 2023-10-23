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

  const modulatedDirection = direction < 348.75 && direction > -11.25 ? direction : direction < -11.25 ? 360 + direction : 360 - direction
  const arr = [...windDirections.keys()].find(key => key[0] <= modulatedDirection && modulatedDirection <= key[1])
  if (!arr) return ""
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

export { getWindDirection, getWindDirectionArrow }
