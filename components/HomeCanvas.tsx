"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";

const FilmShader = {
  uniforms: {
    uTime: { value: 0 },
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;

    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      float wave =
        sin(uv.x * 4.0 + uTime * 0.35) *
        0.5 + 0.5;

      float wave2 =
        cos(uv.y * 3.0 - uTime * 0.22) *
        0.5 + 0.5;

      // Terzo layer, molto lento: respiro ampio sull'intera scena
      float wave3 =
        sin((uv.x - uv.y) * 1.6 + uTime * 0.09) *
        0.5 + 0.5;

      vec3 forest = vec3(0.035, 0.075, 0.045);
      vec3 forestLight = vec3(0.10, 0.16, 0.11);
      vec3 ochre = vec3(0.48, 0.36, 0.17);
      vec3 bordeaux = vec3(0.34, 0.10, 0.12);

      vec3 color = mix(
        forest,
        forestLight,
        wave * 0.65
      );

      color = mix(
        color,
        ochre,
        wave2 * 0.18
      );

      // Accenno di bordeaux, molto contenuto, solo dove i layer coincidono
      float emberMask = smoothstep(0.82, 1.0, wave2 * wave3);
      color = mix(color, bordeaux, emberMask * 0.12);

      float vignette =
        smoothstep(
          0.95,
          0.15,
          distance(uv, vec2(0.5))
        );

      color *= 0.65 + vignette * 0.35;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

function BackgroundPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const material =
      meshRef.current.material as THREE.ShaderMaterial;

    material.uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial args={[FilmShader]} />
    </mesh>
  );
}

export default function HomeCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 1],
          zoom: 1,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <BackgroundPlane />
      </Canvas>
    </div>
  );
}