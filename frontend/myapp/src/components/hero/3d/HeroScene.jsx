
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import HeroCar from "./HeroCar.jsx";

function Loader() {
  return (
    <Html center>
      <div className="zipree-hero-loader">
        <div className="zipree-hero-loader__ring" />
        <p className="zipree-hero-loader__text">
          Preparing your experience...
        </p>
      </div>
    </Html>
  );
}

function SceneFallback() {
  return (
    <Html center>
      <div className="zipree-hero-loader__text">
        Unable to load vehicle.
      </div>
    </Html>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      shadows
      camera={{
        position: [5, 2.2, 7],
        fov: 32,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <color attach="background" args={["#09090B"]} />

      <Suspense fallback={<Loader />}>
        <HeroCar />
      </Suspense>
    </Canvas>
  );
}
