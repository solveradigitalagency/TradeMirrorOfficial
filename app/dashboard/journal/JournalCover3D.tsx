
"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  RoundedBox,
  Text,
} from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { createLeatherMaps } from "./leather-texture";

function LeatherBook({
  onOpen,
}: {
  onOpen: () => void;
}) {
  const leatherMaps = useMemo(() => createLeatherMaps(), []);

  const leatherMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: leatherMaps.colorMap,
        normalMap: leatherMaps.normalMap,
        normalScale: new THREE.Vector2(0.16, 0.16),
        roughness: 0.96,
        metalness: 0,
      }),
    [leatherMaps]
  );

  const spineMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#142640",
        roughness: 0.95,
        metalness: 0,
      }),
    []
  );

  const pageEdgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e5dccb",
        roughness: 0.98,
        metalness: 0,
      }),
    []
  );

  const strapMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#18395f",
        roughness: 0.97,
        metalness: 0,
      }),
    []
  );

  const ribbonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1766ad",
        roughness: 0.98,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    []
  );

  const logoMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#09192b",
        roughness: 0.92,
        metalness: 0,
      }),
    []
  );

  const handleOpen = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onOpen();
  };

  return (
    <group
      rotation={[0, 0, 0]}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Main body and page block */}
      <RoundedBox
        args={[2.68, 3.72, 0.25]}
        radius={0.09}
        smoothness={8}
        position={[0.035, 0, -0.105]}
        castShadow
        receiveShadow
      >
        <primitive object={spineMaterial} attach="material" />
      </RoundedBox>

      <RoundedBox
        args={[2.56, 3.55, 0.21]}
        radius={0.055}
        smoothness={6}
        position={[0.015, 0, 0.015]}
        castShadow
        receiveShadow
      >
        <primitive object={pageEdgeMaterial} attach="material" />
      </RoundedBox>

      {/* Front leather cover */}
      <RoundedBox
        args={[2.65, 3.72, 0.19]}
        radius={0.09}
        smoothness={8}
        position={[0, 0, 0.135]}
        castShadow
        receiveShadow
        onClick={handleOpen}
      >
        <primitive object={leatherMaterial} attach="material" />
      </RoundedBox>

      {/* Rounded leather spine */}
      <RoundedBox
        args={[0.22, 3.73, 0.25]}
        radius={0.075}
        smoothness={8}
        position={[-1.205, 0, 0.16]}
        castShadow
        receiveShadow
        onClick={handleOpen}
      >
        <primitive object={spineMaterial} attach="material" />
      </RoundedBox>

      {/* Subtle edge detail */}
      <mesh position={[-1.265, 0, 0.287]}>
        <boxGeometry args={[0.006, 3.47, 0.002]} />
        <meshStandardMaterial
          color="#29496d"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Right-side elastic closure */}
      <RoundedBox
        args={[0.09, 3.71, 0.045]}
        radius={0.035}
        smoothness={8}
        position={[0.985, 0, 0.245]}
        castShadow
        onClick={handleOpen}
      >
        <primitive object={strapMaterial} attach="material" />
      </RoundedBox>

      {/* Fine fabric ribs */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          position={[
            0.956 + i * 0.009,
            0,
            0.269,
          ]}
        >
          <boxGeometry args={[0.0015, 3.58, 0.0015]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#25466c" : "#10243e"}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Blue fabric bookmark */}
      <mesh
        position={[-0.91, -2.0, 0.17]}
        castShadow
        onClick={handleOpen}
      >
        <boxGeometry args={[0.055, 0.62, 0.012]} />
        <primitive object={ribbonMaterial} attach="material" />
      </mesh>

      {/* Embossed TradeMirror emblem */}
      <group position={[0, -0.02, 0.235]}>
        {[
          { x: -0.105, h: 0.15 },
          { x: 0, h: 0.23 },
          { x: 0.105, h: 0.18 },
        ].map((bar, i) => (
          <RoundedBox
            key={i}
            args={[0.055, bar.h, 0.009]}
            radius={0.006}
            smoothness={3}
            position={[bar.x, 0.23 + bar.h / 2, 0]}
          >
            <primitive object={logoMaterial} attach="material" />
          </RoundedBox>
        ))}

        <Text
          position={[0, -0.015, 0.012]}
          fontSize={0.105}
          letterSpacing={0.12}
          anchorX="center"
          anchorY="middle"
          color="#09192b"
          outlineWidth={0.0008}
          outlineColor="#34516e"
        >
          TRADEMIRROR
        </Text>

        <Text
          position={[0, -0.20, 0.012]}
          fontSize={0.055}
          letterSpacing={0.19}
          anchorX="center"
          anchorY="middle"
          color="#7895b5"
        >
          TRADING JOURNAL
        </Text>
      </group>

      {/* Transparent click surface */}
      <mesh
        position={[0, 0, 0.245]}
        onClick={handleOpen}
      >
        <planeGeometry args={[2.62, 3.7]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function JournalCover3D({
  onOpen,
}: {
  onOpen: () => void;
}) {
  return (
    <div className="relative mx-auto h-[min(76vh,650px)] min-h-[400px] w-full max-w-[520px]">
      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 32,
        }}
        dpr={[1, 1.5]}
        shadows
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        {/* Soft lighting preserves the leather grain */}
        <ambientLight intensity={0.65} />

        <hemisphereLight
          args={["#d9e5f5", "#111827", 0.7]}
        />

        <directionalLight
          position={[-3, 4, 5]}
          intensity={1.15}
          color="#dce8f7"
          castShadow
        />

        <pointLight
          position={[3, 0, 3]}
          intensity={0.55}
          color="#5279a8"
        />

        <LeatherBook onOpen={onOpen} />

        <ContactShadows
          position={[0, -2.0, -0.35]}
          opacity={0.3}
          scale={4.5}
          blur={2.8}
          far={4}
        />
      </Canvas>

      <p className="pointer-events-none absolute bottom-1 left-0 right-0 text-center text-xs tracking-wide text-slate-400/80">
        Click to open
      </p>
    </div>
  );
}
