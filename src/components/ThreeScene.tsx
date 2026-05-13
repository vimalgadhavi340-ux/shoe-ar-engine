import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { FootPoseRef } from '../types/footPoseRef';

useGLTF.preload('/models/shoe.glb');

// Corrects the GLB's native axes to match world axes.
// The model's heel-to-toe should align with world +X after this
// rotation is applied. Adjust if the shoe appears rotated incorrectly
// on phone testing:
//   - 90° wrong heading → try [0, 0, Math.PI / 2] or [0, 0, -Math.PI / 2]
//   - Upside down → try [Math.PI, 0, 0] or [0, 0, Math.PI]
//   - Mirrored / lying on side → try [Math.PI / 2, 0, 0]
const MODEL_ROTATION_OFFSET: [number, number, number] = [0, 0, 0];

interface ThreeSceneProps {
  footPoseRef: FootPoseRef;
}

export function ThreeScene({ footPoseRef }: ThreeSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Shoe footPoseRef={footPoseRef} />
      </Suspense>
    </Canvas>
  );
}

function Shoe({ footPoseRef }: { footPoseRef: FootPoseRef }) {
  const outerRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  const { scene } = useGLTF('/models/shoe.glb');

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const modelLength = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const dims = box.getSize(new THREE.Vector3());
    return Math.max(dims.x, dims.y, dims.z);
  }, [clonedScene]);

  useFrame(() => {
    const group = outerRef.current;
    if (!group) return;
    const pose = footPoseRef.current?.right;

    if (!pose || !pose.isVisible) {
      group.visible = false;
      return;
    }
    group.visible = true;

    group.position.x = pose.position.x - size.width / 2;
    group.position.y = size.height / 2 - pose.position.y;
    group.position.z = 0;

    group.rotation.set(0, 0, -pose.angleDegrees * Math.PI / 180);

    const factor = pose.scalePixels / modelLength;
    group.scale.setScalar(factor);
  });

  return (
    <group ref={outerRef}>
      <group rotation={MODEL_ROTATION_OFFSET}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}
