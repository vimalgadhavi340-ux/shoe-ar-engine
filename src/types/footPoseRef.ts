import type { MutableRefObject } from 'react'
import type { FootPose } from '../lib/footPose'

export interface FootPoseSnapshot {
  left: FootPose | null
  right: FootPose | null
}

export type FootPoseRef = MutableRefObject<FootPoseSnapshot>
