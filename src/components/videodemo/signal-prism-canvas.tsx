"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  Lightformer,
  MeshTransmissionMaterial,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * The glass the film stands in front of.
 *
 * arkitech-smoked-prism-glass.webp used to be pasted onto the page as a flat
 * panel, where it read as a dark rectangle. Here it is the scene's key light
 * instead: mapped onto a Lightformer, it becomes the thing the glass actually
 * reflects and refracts, so the same asset produces depth rather than a slab.
 *
 * Everything here is decorative and the page is complete without it — see
 * signal-prism.tsx for the gate that decides whether it loads at all.
 */

const PRISM_TEXTURE = "/videodemo/arkitech-smoked-prism-glass.webp";

/** Story palette — the three tones the timeline rail runs through. */
const EMBER = "#f0a868";
const AGENT = "#8b7cf6";
const BOOKED = "#34d399";

function GlassCluster({ background }: { background: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const cluster = group.current;
    if (!cluster) return;

    // A slow sway rather than a full rotation: the cluster is composed to sit
    // clear of the film frame, and an unbounded spin would carry it across.
    // Damped rather than lerped, so the response is the same at 60Hz and 120Hz.
    const sway = Math.sin(state.clock.elapsedTime * 0.13) * 0.34;
    cluster.rotation.y = THREE.MathUtils.damp(
      cluster.rotation.y,
      sway + state.pointer.x * 0.42,
      2.2,
      delta,
    );
    cluster.rotation.x = THREE.MathUtils.damp(
      cluster.rotation.x,
      Math.sin(state.clock.elapsedTime * 0.09) * 0.1 + state.pointer.y * -0.26,
      2.2,
      delta,
    );
  });

  return (
    <group ref={group}>
      {/* An actual triangular prism — a three-sided cylinder is exactly that
          solid — standing in the gutter between the headline and the film,
          where it is fully visible rather than hiding behind an edge. */}
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[-0.75, 0.02, 0]} rotation={[0.1, 0, 0.13]}>
          <cylinderGeometry args={[0.46, 0.46, 2.6, 3, 1]} />
          <MeshTransmissionMaterial
            samples={8}
            resolution={384}
            transmission={1}
            thickness={0.9}
            roughness={0.05}
            ior={1.48}
            chromaticAberration={0.3}
            anisotropicBlur={0.2}
            distortion={0.3}
            distortionScale={0.4}
            temporalDistortion={0.1}
            color="#ded9ff"
            background={background}
            backside
            backsideThickness={0.45}
          />
        </mesh>
      </Float>

    </group>
  );
}

function Studio({ prism }: { prism: THREE.Texture }) {
  return (
    <Environment resolution={256} frames={1}>
      {/* The asset itself, doing the lighting. */}
      <Lightformer
        form="rect"
        map={prism}
        intensity={2.6}
        scale={[9, 13, 1]}
        position={[4.5, 0, -5]}
        rotation={[0, -0.5, 0]}
      />
      <Lightformer
        form="rect"
        color={AGENT}
        intensity={2.2}
        scale={[7, 7, 1]}
        position={[0, 6, -4]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Mirrored on the copy side, or the shards over there face nothing and
          come back black. */}
      <Lightformer
        form="rect"
        map={prism}
        intensity={2}
        scale={[7, 11, 1]}
        position={[-4.5, 0.5, -4]}
        rotation={[0, 0.5, 0]}
      />
      <Lightformer
        form="rect"
        color={EMBER}
        intensity={2.4}
        scale={[4, 9, 1]}
        position={[-5.5, 1.5, 1]}
        rotation={[0, 1.1, 0]}
      />
      <Lightformer
        form="circle"
        color={BOOKED}
        intensity={1.5}
        scale={3.2}
        position={[-2.2, -4.5, -2]}
      />
    </Environment>
  );
}

function Scene() {
  // Configured in the loader callback rather than on the returned texture —
  // mutating a hook's return value during render is not allowed.
  const prism = useTexture(PRISM_TEXTURE, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

  return (
    <>
      <Studio prism={prism} />
      {/* Direct lights on top of the environment, so the facet edges always
          catch a highlight even where the env map is dark. */}
      <ambientLight intensity={0.9} />
      <pointLight position={[3, 2, 4]} intensity={30} color={AGENT} distance={16} />
      <pointLight position={[-3, -0.5, 3.5]} intensity={26} color={EMBER} distance={14} />
      <pointLight position={[-1.5, 2.5, 3]} intensity={18} color="#ffffff" distance={12} />
      <pointLight position={[0, -3, 2]} intensity={14} color={BOOKED} distance={10} />
      <GlassCluster background={prism} />
    </>
  );
}

export function SignalPrismCanvas({ active }: { active: boolean }) {
  return (
    <Canvas
      // Stops rendering entirely once the hero scrolls away.
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
