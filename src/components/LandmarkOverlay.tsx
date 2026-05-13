import { useEffect, useRef, type RefObject } from 'react'
import { usePoseLandmarker } from '../hooks/usePoseLandmarker'
import { normalizedToContainerPixel } from '../lib/coordinateTransform'

interface LandmarkOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
}

const FOOT_LANDMARK_LABELS: Record<number, string> = {
  27: 'L_ankle',
  28: 'R_ankle',
  29: 'L_heel',
  30: 'R_heel',
  31: 'L_toe',
  32: 'R_toe',
}

function colorForLandmark(index: number): string {
  if (index >= 27 && index <= 32) return '#00ff00'
  if (index >= 23 && index <= 26) return '#e91e63'
  if (index >= 11 && index <= 22) return '#00e5ff'
  return '#ffeb3b'
}

export function LandmarkOverlay({ videoRef }: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { landmarker, isReady } = usePoseLandmarker()

  useEffect(() => {
    if (!isReady || !landmarker) return

    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const container = canvas.parentElement
    if (!container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let lastVideoTime = -1
    let frameCount = 0
    let containerW = container.clientWidth
    let containerH = container.clientHeight

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerW = Math.round(entry.contentRect.width)
        containerH = Math.round(entry.contentRect.height)
      }
    })
    observer.observe(container)

    const tick = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== containerW || canvas.height !== containerH) {
          canvas.width = containerW
          canvas.height = containerH
        }

        const now = performance.now()
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime
          const result = landmarker.detectForVideo(video, now)

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          const videoSize = { w: video.videoWidth, h: video.videoHeight }
          const containerSize = { w: canvas.width, h: canvas.height }

          for (const pose of result.landmarks) {
            const footCoords: Record<string, Point2D> = {}

            for (let i = 0; i < pose.length; i++) {
              const { x, y } = normalizedToContainerPixel(
                pose[i],
                videoSize,
                containerSize,
              )

              ctx.beginPath()
              ctx.arc(x, y, 6, 0, Math.PI * 2)
              ctx.fillStyle = colorForLandmark(i)
              ctx.fill()

              const label = FOOT_LANDMARK_LABELS[i]
              if (label !== undefined) {
                footCoords[label] = {
                  x: Math.round(x),
                  y: Math.round(y),
                }
              }
            }

            if (frameCount % 30 === 0 && Object.keys(footCoords).length > 0) {
              console.log('[Foot landmarks]', footCoords)
            }
          }

          frameCount++
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [isReady, landmarker, videoRef])

  return <canvas ref={canvasRef} className="landmark-overlay" />
}

interface Point2D {
  x: number
  y: number
}
