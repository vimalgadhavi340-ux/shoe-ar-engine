import { useEffect, useState } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task'

export interface UsePoseLandmarkerResult {
  landmarker: PoseLandmarker | null
  isReady: boolean
  error: Error | null
}

export function usePoseLandmarker(): UsePoseLandmarkerResult {
  const [landmarker, setLandmarker] = useState<PoseLandmarker | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    let created: PoseLandmarker | null = null

    async function load() {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
        if (cancelled) return

        created = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })

        if (cancelled) {
          created.close()
          return
        }
        setLandmarker(created)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    load()

    return () => {
      cancelled = true
      created?.close()
    }
  }, [])

  return {
    landmarker,
    isReady: landmarker !== null,
    error,
  }
}
