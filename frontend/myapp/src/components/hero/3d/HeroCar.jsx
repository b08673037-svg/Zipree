
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  useGLTF,
} from "@react-three/drei";
import { Box3, Vector3 } from "three";

export default function HeroCar() {
  const { scene } = useGLTF("/porsche.glb");
  const carRef = useRef();

  // Clone and automatically normalize the original model.
  const car = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.updateMatrixWorld(true);

    const box = new Box3().setFromObject(clonedScene);
    const size = new Vector3();
    const center = new Vector3();

    box.getSize(size);
    box.getCenter(center);

    // Target car size: approximately 4.5 scene units.
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = 4.5 / maxDimension;

    // Preserve original model materials and enable shadows.
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.envMapIntensity = 0.65;
          child.material.needsUpdate = true;
        }
      }
    });

    // Center horizontally and place the bottom on the floor.
    clonedScene.scale.setScalar(scale);
    clonedScene.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale
    );

    return clonedScene;
  }, [scene]);

  // One smooth rotation system.
  useFrame((state, delta) => {
    if (carRef.current) {
      carRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <>
      <group ref={carRef}>
        <primitive object={car} />
      </group>

{/* Dark luxury studio environment */}
<Environment preset="studio" />

{/* Soft ambient lighting */}
<ambientLight intensity={0.15} />

<hemisphereLight
  skyColor="#aeb7c4"
  groundColor="#111111"
  intensity={0.25}
/>

{/* Soft overhead light */}
<spotLight
  position={[2, 8, 5]}
  intensity={25}
  angle={0.55}
  penumbra={1}
  distance={25}
  color="#fff0dc"
/>

{/* Subtle champagne rim lighting */}
<spotLight
  position={[-6, 4, -4]}
  intensity={12}
  angle={0.7}
  penumbra={1}
  distance={20}
  color="#C6A46A"
/>

{/* Gentle front fill */}
<pointLight
  position={[0, 3, 7]}
  intensity={3}
  color="#dce5f5"
  distance={18}
/>

      {/* Dark studio floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.015, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#090a0c"
          roughness={0.38}
          metalness={0.25}
        />
      </mesh>

      {/* Soft contact shadow beneath the vehicle */}
      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.65}
        scale={8}
        blur={3}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

useGLTF.preload("/porsche.glb");
