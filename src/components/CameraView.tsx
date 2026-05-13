import { useEffect, useRef, useState } from 'react'

type CameraError = 'denied' | 'no-camera' | 'unknown' | null

export function CameraView() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<CameraError>(null)

  useEffect(() => {
    let cancelled = false
    let acquired: MediaStream | null = null

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('no-camera')
        return
      }
      try {
        acquired = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          acquired.getTracks().forEach((t) => t.stop())
          return
        }
        setStream(acquired)
        if (videoRef.current) {
          videoRef.current.srcObject = acquired
        }
      } catch (err) {
        if (cancelled) return
        const name = (err as DOMException)?.name
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          setError('denied')
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          setError('no-camera')
        } else {
          setError('unknown')
        }
      }
    }

    start()

    return () => {
      cancelled = true
      acquired?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  if (error) {
    const message =
      error === 'denied'
        ? 'Camera access required to continue'
        : error === 'no-camera'
          ? 'No camera detected'
          : 'Unable to start camera'
    return (
      <div className="camera-root">
        <p className="camera-error">{message}</p>
      </div>
    )
  }

  return (
    <div className="camera-root">
      <video
        ref={videoRef}
        className="camera-video"
        autoPlay
        playsInline
        muted
      />
      {stream && <div className="camera-status">Camera Active</div>}
    </div>
  )
}
