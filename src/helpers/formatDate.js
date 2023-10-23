function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(new Date(dateStr))
}

export { formatDay }
