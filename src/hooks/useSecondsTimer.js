import { useState, useEffect } from "react"

export default function useSecondsTimer(initialTime, waitForStart = false) {
  const [startTime, setStartTime] = useState(initialTime)
  const [secondsPassed, setSecondsPassed] = useState(0)
  const [keepTicking, setKeepTicking] = useState(!waitForStart)

  const toSeconds = (milliseconds) => milliseconds / 1000

  const calcSecondsPassed = (timeNow, startTime) =>
    parseInt(toSeconds(timeNow) - toSeconds(startTime))

  useEffect(() => {
    /* useEffect holds on to the intial start time if it doesn't depend on the
    startTime prop- this is why the timer doesn't reset the the parent
    component reloads */
    if (keepTicking) {
      const interval = setInterval(
        () => setSecondsPassed(calcSecondsPassed(Date.now(), startTime)),
        1000
      )

      return () => clearInterval(interval)
    }
  }, [startTime, keepTicking])

  const stopTimer = () => setKeepTicking(false)
  const startTimer = () => {
    if (keepTicking) return
    setStartTime(Date.now())
    setSecondsPassed(0)
    setKeepTicking(true)
  }

  if (waitForStart) {
    return [secondsPassed, stopTimer, startTimer]
  } else {
    return [secondsPassed, stopTimer]
  }
}
