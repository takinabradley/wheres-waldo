export default function findElementOffset(element) {
  // find how many pixels an element is from the left and top of the page
  if (element.offSetParent === undefined) {
    return [element.offsetLeft, element.offsetTop]
  }

  let x = 0
  let y = 0
  let offsetElement = element

  while (offsetElement !== undefined) {
    x += offsetElement.offsetLeft
    y += offsetElement.offsetTop
    offsetElement = offsetElement.offSetParent
  }
  return [x, y]
}
