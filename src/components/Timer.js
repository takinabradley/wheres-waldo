import { useState, useEffect } from "react"
export default function Timer({ startTime }) {
  const [secondsPassed, setSecondsPassed] = useState(0)

  const toSeconds = (milliseconds) => milliseconds / 1000

  const calcSecondsPassed = (timeNow, startTime) =>
    parseInt(toSeconds(timeNow) - toSeconds(startTime))

  useEffect(() => {
    /* useEffect holds on to the intial start time if it doesn't depend on the
    startTime prop- this is why the timer doesn't reset the the parent
    component reloads */
    const interval = setInterval(
      () => setSecondsPassed(calcSecondsPassed(Date.now(), startTime)),
      1000
    )

    return () => clearInterval(interval)
  }, [])
  return <div>{secondsPassed}</div>
}
