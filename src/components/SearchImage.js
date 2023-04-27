import { useEffect, useRef, useState, useLayoutEffect } from "react"
import useWindowSize from "../hooks/useWindowSize"
import BoxCursor from "./BoxCurser"
import findElementOffset from "../helpers/findElementOffset"

const toPercent = (decimal) => decimal * 100

export default function SearchImage({ img, onPositionChosen }) {
  // we use a ref callback so state is updated with the ref is set
  const [imgRef, setImgRef] = useState(null)

  // listen to window size so we know we should resize curser
  const [width, height] = useWindowSize()

  // track what the curser's width and height should be with state
  const [cursorSize, setCursorSize] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    if (imgRef) {
      /* 
        This is the best way I could find to change the curser size as close to
        immediately as possible.

        Without using an event listener, for some reason measuring element heights 
        yeild 0 immeditatly after render, and I didn't trust setTimeout or async 
        await hacks to always work.

        This method also gives the benefit of the curser not appearing until a
        user moves their mouse over the element
      */
      const changeCurserSize = () => {
        setCursorSize({
          x: calcCurserSize("x"),
          y: calcCurserSize("y")
        })
      }

      imgRef.addEventListener("mousemove", changeCurserSize, { once: true })

      return () => {
        imgRef.removeEventListener("mousemove", changeCurserSize, {
          once: true
        })
      }
    }
  }, [imgRef, width, height])

  function findImageCoords(e) {
    // size of image
    const imgStyles = window.getComputedStyle(imgRef)
    const imgWidth = imgStyles.width.slice(0, -2)
    const imgHeight = imgStyles.height.slice(0, -2)

    // where user clicked on the page
    const pageX = e.pageX
    const pageY = e.pageY

    // where the top left corner of the element should be
    const [offsetX, offsetY] = findElementOffset(imgRef)

    // where the user clicked relative to the image
    const imgX = pageX - offsetX
    const imgY = pageY - offsetY

    // where the user clicked relative to the image as a percentage
    const xPercent = toPercent(imgX / imgWidth)
    const yPercent = toPercent(imgY / imgHeight)

    return {
      pageCoords: { x: pageX, y: pageY },
      imgCoords: { x: imgX, y: imgY },
      imgPercents: { x: xPercent, y: yPercent }
    }
  }

  function selectPosition(e) {
    // grab image percents as they're most useful for images that may change size
    // the page coordinates may also be useful for creating a tooltip-like thing
    const { imgPercents } = findImageCoords(e)
    onPositionChosen(imgPercents)
  }

  function calcCurserSize(axis) {
    // base the size of the curser off the the image elements width and height
    // currently set to 1/3 the size
    if (imgRef) {
      const imgWidth = imgRef.clientWidth
      const imgHeight = imgRef.clientHeight
      if (axis === "x") return `${parseInt(imgWidth / 3)}`
      if (axis === "y") return `${parseInt(imgHeight / 3)}`
    }
  }

  return (
    <div className="search-image" style={{ overflow: "none" }}>
      <BoxCursor
        width={cursorSize.x + "px"}
        height={cursorSize.y + "px"}
        boundElement={imgRef}
      />
      <img
        src={img}
        alt="Search Image"
        ref={setImgRef}
        onClick={selectPosition}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
}
