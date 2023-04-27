import React, { useEffect, useRef } from "react"
export default function BoxCursor({ width, height, boundElement }) {
  const cursor = useRef()

  function moveBox(e) {
    const x = e.pageX
    const y = e.pageY

    // offset position of the box by half it's width and height to center
    // the mouse pointer inside of it
    const computedStyles = window.getComputedStyle(cursor.current)
    const xOffSet = computedStyles.width.slice(0, -2) / 2
    const yOffSet = computedStyles.height.slice(0, -2) / 2

    cursor.current.style.top = `${y - yOffSet}px`
    cursor.current.style.left = `${x - xOffSet}px`
  }

  useEffect(() => {
    if (boundElement) {
      // if a bound element is set, restrict the mousemove events to that element
      boundElement.addEventListener("mousemove", moveBox)
      return () => boundElement.removeEventListener("mousemove", moveBox)
    } else {
      // otherwise allow the curser to be used on the whole document
      document.addEventListener("mousemove", moveBox)
      return () => document.removeEventListener("mousemove", moveBox)
    }
  }, [boundElement])

  const style = {
    pointerEvents: "none",
    position: "absolute",
    border: "1px solid black",
    width: width,
    height: height
  }

  return <div className="cursor" style={style} ref={cursor}></div>
}
