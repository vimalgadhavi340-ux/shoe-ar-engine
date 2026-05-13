import { useEffect, useRef, type RefObject } from 'react'
import { usePoseLandmarker } from '../hooks/usePoseLandmarker'

interface LandmarkOverlayProps {
  videoRef: RefObject<HTMLVideoElement | null>
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

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let lastVideoTime = -1

    const tick = () => {
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
        }

        const now = performance.now()
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime
          const result = landmarker.detectForVideo(video, now)

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          for (const pose of result.landmarks) {
            for (let i = 0; i < pose.length; i++) {
              const lm = pose[i]
              const x = lm.x * canvas.width
              const y = lm.y * canvas.height
              ctx.beginPath()
              ctx.arc(x, y, 6, 0, Math.PI * 2)
              ctx.fillStyle = colorForLandmark(i)
              ctx.fill()
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [isReady, landmarker, videoRef])

  return <canvas ref={canvasRef} className="landmark-overlay" />
}
