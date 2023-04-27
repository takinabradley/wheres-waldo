import { useEffect, useRef, useState } from "react"
import Timer from "./Timer"
import SearchImage from "./SearchImage"
import img from "./images/bullseye.jpg"

export default function App() {
  const [forceRerender, setForceRerender] = useState(0)
  const [mountTimer, setMountTimer] = useState(true)
  function logPosition(pos) {
    console.log(pos)
    if (pos.x > 33 && pos.x < 66 && pos.y > 33 && pos.y < 66)
      console.log("BULLSEYE")
  }

  return (
    <div className="app">
      <div className="buttons">
        <button onClick={() => setForceRerender(forceRerender + 1)}>
          Rerender
        </button>
        <button onClick={() => setMountTimer(!mountTimer)}>Toggle Timer</button>
      </div>
      <div className="components">
        {mountTimer ? <Timer startTime={Date.now()} /> : null}
        <SearchImage
          img={img}
          onPositionChosen={logPosition}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}
