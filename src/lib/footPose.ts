import type { NormalizedLandmark } from '@mediapipe/tasks-vision'
import type { Point, Size } from './coordinateTransform'
import { normalizedToContainerPixel } from './coordinateTransform'

export interface FootPose {
  side: 'left' | 'right'
  isVisible: boolean
  heel: Point
  toe: Point
  ankle: Point
  position: Point
  angleDegrees: number
  scalePixels: number
}

export function computeFootPose(
  heelLandmark: NormalizedLandmark,
  toeLandmark: NormalizedLandmark,
  ankleLandmark: NormalizedLandmark,
  side: 'left' | 'right',
  video: Size,
  container: Size,
): FootPose {
  const heel = normalizedToContainerPixel(heelLandmark, video, container)
  const toe = normalizedToContainerPixel(toeLandmark, video, container)
  const ankle = normalizedToContainerPixel(ankleLandmark, video, container)

  const dx = toe.x - heel.x
  const dy = toe.y - heel.y

  const heelVisibility = heelLandmark.visibility ?? 0
  const toeVisibility = toeLandmark.visibility ?? 0
  const ankleVisibility = ankleLandmark.visibility ?? 0

  const isVisible =
    heelVisibility >= 0.5 && toeVisibility >= 0.5 && ankleVisibility >= 0.5

  return {
    side,
    isVisible,
    heel,
    toe,
    ankle,
    position: {
      x: (heel.x + toe.x) / 2,
      y: (heel.y + toe.y) / 2,
    },
    angleDegrees: (Math.atan2(dy, dx) * 180) / Math.PI,
    scalePixels: Math.hypot(dx, dy),
  }
}
