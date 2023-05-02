import { useEffect, useRef, useState, useLayoutEffect, useReducer } from "react"
import useWindowSize from "../hooks/useWindowSize"
import BoxCursor from "./BoxCursor"
import SearchImageMarker from "./SearchImageMarker"
import findElementOffset from "../helpers/findElementOffset"

const toPercent = (decimal) => decimal * 100

function getElementWidthAndHeight(elem) {
  const elemStyles = window.getComputedStyle(elem)
  const elemWdith = elemStyles.width.slice(0, -2) // remove 'px' unit
  const elemHeight = elemStyles.height.slice(0, -2)
  return [elemWdith, elemHeight]
}

export default function SearchImage({
  img,
  onAllCharactersFound,
  DOMMutationNotification
}) {
  // listen to window size so we know we should resize cursor
  const [windowWidth, windowHeight] = useWindowSize()
  // we use a ref callback so state is updated with the ref is set
  const [imgRef, setImgRef] = useState(null)
  // track what the cursor's width and height should be with state
  const [cursorSize, setCursorSize] = useState({ x: 0, y: 0 })
  // track where markers should be on the image
  const [markerPositions, setMarkerPositions] = useState([])
  // list of character positions
  const [characters, setCharacters] = useState([])
  // list of character names that have already been hit
  const [hitCharacters, setHitCharacters] = useState([])

  useEffect(() => {
    // fetch character list
    setCharacters([
      {
        name: "bullseye",
        position: {
          minX: 33,
          maxX: 66,
          minY: 33,
          maxY: 66
        }
      }
    ])
  }, [])

  useLayoutEffect(() => {
    function changeCursorSize() {
      setCursorSize({
        x: calcCursorSize("x"),
        y: calcCursorSize("y")
      })
    }

    // check if the callback ref is set
    if (imgRef) {
      // if it is, check if the image is done loading
      if (!imgRef.complete) {
        // if it's not, set up an load event to change cursor size later
        console.log("wasn't complete")
        imgRef.addEventListener("load", changeCursorSize, { once: true })
        return () =>
          imgRef.removeEventListener("load", changeCursorSize, { once: true })
      } else {
        // otherwise, change the curser size
        changeCursorSize()
      }
    }

    // DOMMutationNotification?
    // This is a prop that notifies this component when other elemements are
    // added/removed/moved around in the DOM so that we know we should rerender
    // curser and marker positions
  }, [imgRef, windowWidth, windowHeight, DOMMutationNotification])

  function findImageCoords(e) {
    // size of image in px
    const [imgWidth, imgHeight] = getElementWidthAndHeight(imgRef)
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
      imgPercents: { x: xPercent, y: yPercent },
      imgOffset: { x: offsetX, y: offsetY }
    }
  }

  function coordsExist(markerPositions, imgCoords) {
    return markerPositions.some(
      (pos) =>
        pos.imgCoords.x === imgCoords.x && pos.imgCoords.y === imgCoords.y
    )
  }

  function findHitCharacter(imgPercents) {
    const percentX = imgPercents.x
    const percentY = imgPercents.y

    for (const index in characters) {
      const { minX, maxX, minY, maxY } = characters[index].position
      if (
        percentX >= minX &&
        percentX <= maxX &&
        percentY >= minY &&
        percentY <= maxY
      ) {
        return characters[index].name
      }
    }

    return false
  }

  function allCharactersFound(hitCharacterList) {
    if (hitCharacterList.length === characters.length) return true
    return false
  }

  function selectPosition(e) {
    e.preventDefault()
    // grab image percents as they're most useful for images that may change size
    // the page coordinates may also be useful for creating a tooltip-like thing
    const { imgPercents, imgCoords } = findImageCoords(e)
    const [imgWidth, imgHeight] = getElementWidthAndHeight(imgRef)
    const hitCharacter = findHitCharacter(imgPercents)
    const characterIsAlreadyHit = hitCharacters.includes(hitCharacter)

    // add a position if a new character has been hit
    setMarkerPositions((prevState) => {
      // return previous state if this coordinate has been picked already
      if (
        coordsExist(prevState, imgCoords) ||
        !hitCharacter ||
        characterIsAlreadyHit
      )
        return prevState

      // otherwise, add the new coordinate data
      return [
        ...prevState,
        {
          imgCoords,
          imgPercents,
          matchesCharacter: findHitCharacter(imgPercents) ? true : false,
          imgWidthWhenStored: imgWidth,
          imgHeightWhenStored: imgHeight
        }
      ]
    })

    // if a new character has been hit, add it to list of hit characters
    if (hitCharacter && !characterIsAlreadyHit) {
      setHitCharacters([...hitCharacters, hitCharacter])
    }

    // if a new character has been hit, check if all characters have been hit
    // by adding the character that was just hit to this list.
    // if a character was not hit, make sure not to add it to the list
    const newHitCharacterList = hitCharacters
    if (!characterIsAlreadyHit) newHitCharacterList.push(hitCharacter)

    console.log(
      "hit character",
      hitCharacter,
      "all characters hit?",
      allCharactersFound(newHitCharacterList),
      newHitCharacterList
    )
    if (allCharactersFound(newHitCharacterList))
      onAllCharactersFound(imgPercents)
  }

  function calcCursorSize(axis) {
    // base the size of the cursor off the the image elements width and height
    // currently set to 1/3 the size
    if (imgRef) {
      const imgWidth = imgRef.clientWidth
      const imgHeight = imgRef.clientHeight
      if (axis === "x") return `${parseInt(imgWidth / 3)}`
      if (axis === "y") return `${parseInt(imgHeight / 3)}`
    }
  }

  function calcMarkerSize(axis) {
    // base the size of the marker off the the image elements width and height
    // currently set to 1/3 the size
    const imgWidth = imgRef.clientWidth
    const imgHeight = imgRef.clientHeight
    if (axis === "x") return `${parseInt(imgWidth / 3)}`
    if (axis === "y") return `${parseInt(imgHeight / 3)}`
  }

  function calcMarkerPositionAndSize(position) {
    /* 
      translate old position relative to the image to whatever the current 
      image size may be:
      stackoverflow.com/questions/32870568/how-to-recalculate-x-y-coordinates-based-on-screensize

      I need:
      - the position relative to the image
      - the current offset of the image to get the real coords
      - the current image width and height
      - the old image width and height
      formula:
      xcoord = ((originalCoord * currentElementWidth) / previousElementWidth) + offsetX
      ycoord = ((originalCoord * currentElementHeight) / previousElementHeight) + offsetY
    */
    const [imgOffsetX, imgOffsetY] = findElementOffset(imgRef)
    const [currentImgWidth, currentImgHeight] = getElementWidthAndHeight(imgRef)

    const translatedRelativeXCoord = parseInt(
      (position.imgCoords.x * currentImgWidth) / position.imgWidthWhenStored
    )
    const translatedRelativeYCoord = parseInt(
      (position.imgCoords.y * currentImgHeight) / position.imgHeightWhenStored
    )

    const currentPageXCoord = translatedRelativeXCoord + imgOffsetX
    const currentPageYCoord = translatedRelativeYCoord + imgOffsetY

    // get desired width and height relative to image for markers
    const markerWidth = calcMarkerSize("x")
    const markerHeight = calcMarkerSize("y")

    // this is to make the center the marker elements line up with where
    // the user clicked
    const markerXOffset = markerWidth / 2
    const markerYOffset = markerHeight / 2

    const currentPageXCoordWithMarkerOffset = currentPageXCoord - markerXOffset
    const currentPageYCoordWithMarkerOffset = currentPageYCoord - markerYOffset

    return {
      width: markerWidth,
      height: markerHeight,
      left: currentPageXCoordWithMarkerOffset,
      top: currentPageYCoordWithMarkerOffset
    }
  }

  const markers = markerPositions.map((position) => {
    const markerData = calcMarkerPositionAndSize(position)
    const customStyle = {}
    const matchesCharacter = position.matchesCharacter
    if (matchesCharacter) {
      customStyle.border = "2px solid green"
    }

    return (
      <SearchImageMarker
        width={markerData.width + "px"}
        height={markerData.height + "px"}
        left={markerData.left + "px"}
        top={markerData.top + "px"}
        customStyle={customStyle}
        key={position.imgCoords.x.toString() + position.imgCoords.y.toString()}
      />
    )
  })

  return (
    <div className="search-image" style={{ overflowX: "hidden" }}>
      <BoxCursor
        width={cursorSize.x + "px"}
        height={cursorSize.y + "px"}
        boundElement={imgRef}
        customStyle={{ borderRadius: "1000px" }}
      />
      <img
        src={img}
        alt="Search Image"
        draggable="false"
        onClick={selectPosition}
        ref={setImgRef}
        style={{ width: "100%", height: "100%" }}
      />

      {markers || null}
    </div>
  )
}
