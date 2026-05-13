export interface Size {
  w: number
  h: number
}

export interface Point {
  x: number
  y: number
}

export interface CoverParams {
  scale: number
  offsetX: number
  offsetY: number
}

export function getObjectFitCoverParams(
  video: Size,
  container: Size,
): CoverParams {
  const scale = Math.max(container.w / video.w, container.h / video.h)
  const displayedW = video.w * scale
  const displayedH = video.h * scale
  const offsetX = (displayedW - container.w) / 2
  const offsetY = (displayedH - container.h) / 2
  return { scale, offsetX, offsetY }
}

export function normalizedToContainerPixel(
  landmark: Point,
  video: Size,
  container: Size,
): Point {
  const { scale, offsetX, offsetY } = getObjectFitCoverParams(video, container)
  const sourceX = landmark.x * video.w
  const sourceY = landmark.y * video.h
  return {
    x: sourceX * scale - offsetX,
    y: sourceY * scale - offsetY,
  }
}
