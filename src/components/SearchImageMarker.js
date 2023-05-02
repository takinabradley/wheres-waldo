export default function SearchImageMarker({
  width,
  height,
  top,
  left,
  customStyle
}) {
  let style = {
    pointerEvents: "none",
    position: "absolute",
    border: "1px solid black",
    width: width,
    height: height,
    left: left,
    top: top,
    borderRadius: "1000px"
  }

  if (customStyle) style = { ...style, ...customStyle }
  return <div className="marker" style={style}></div>
}
