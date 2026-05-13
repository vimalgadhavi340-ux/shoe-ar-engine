import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import type { FootPoseRef } from '../types/footPoseRef';

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
      <Shoe footPoseRef={footPoseRef} />
    </Canvas>
  );
}

function Shoe({ footPoseRef }: { footPoseRef: FootPoseRef }) {
  const meshRef = useRef<Mesh>(null);
  const { size } = useThree();

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const pose = footPoseRef.current?.right;
    if (!pose || !pose.isVisible) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.position.x = pose.position.x - size.width / 2;
    mesh.position.y = size.height / 2 - pose.position.y;
    mesh.position.z = 0;
    mesh.rotation.z = (-pose.angleDegrees * Math.PI) / 180;
    mesh.scale.setScalar(pose.scalePixels);
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 0.4, 0.2]} />
      <meshStandardMaterial color="#ff4444" />
    </mesh>
  );
}
