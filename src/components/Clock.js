import { useEffect, useState } from "react"

function Clock({ timezone }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString(navigator.languages[0], { timeZone: timezone }))

  useEffect(
    function () {
      const intervalId = setInterval(() => setTime(new Date().toLocaleTimeString(navigator.languages[0], { timeZone: timezone })), 1000)
      return () => clearInterval(intervalId)
    },
    [time, timezone]
  )
  return <div className="clock">Local time: {time}</div>
}

export default Clock
