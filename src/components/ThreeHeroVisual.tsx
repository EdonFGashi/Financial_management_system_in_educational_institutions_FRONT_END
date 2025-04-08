import * as THREE from "three";
import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function IcoSpherePoints({ index }: { index: number }) {
  const ref = useRef<THREE.Points>(null);
  const elapsedTime = useRef(0); // ⬅️ persist animation state
  const offset = index * 0.01;

  useFrame((_, dTime) => {
    elapsedTime.current += dTime * 0.2;
    if (ref.current) {
      ref.current.rotation.x = elapsedTime.current + offset;
      ref.current.rotation.y = elapsedTime.current + offset;
    }
  });

  // Geometry
  const icoGeo = new THREE.IcosahedronGeometry(2, 4);
  const icoVerts = icoGeo.attributes.position;

  // Texture
  const sprite = useLoader(THREE.TextureLoader, "/images/circle.png");

  // Size per layer
  const size = index * 0.0015;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[icoVerts.array, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={0xffffff} // ⬅️ White glowing particles
        size={size}
        map={sprite}
        alphaTest={0.5}
        transparent
      />
    </points>
  );
}

function PointsGroup() {
  const layers = [];
  for (let i = 1; i <= 30; i++) {
    layers.push(<IcoSpherePoints key={i} index={i} />);
  }
  return <group>{layers}</group>;
}

function ThreeHeroVisual() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ toneMapping: THREE.NoToneMapping }}>
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
        <PointsGroup />
        <hemisphereLight args={[0xffffff, 0x000000, 1.0]} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

export default ThreeHeroVisual;
