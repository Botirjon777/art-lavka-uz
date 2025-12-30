"use client";

import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useTexture,
  Environment,
  Decal,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { PrintDesign } from "@/types";
import Loader from "./Loader";

interface TShirtModelProps {
  selectedPrint: PrintDesign | null;
  selectedColor: string;
}

function TShirtModel({ selectedPrint, selectedColor }: TShirtModelProps) {
  const { scene } = useGLTF("/model/compressed/base.glb");
  const modelRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const sceneAddedRef = useRef(false);

  const textureUrl = selectedPrint ? selectedPrint.image : "/prints/cat.png";
  const texture = useTexture(textureUrl);

  // Clone scene only once using useMemo
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && !meshRef.current) {
        meshRef.current = child;
      }
    });
    return cloned;
  }, [scene]);

  // Add cloned scene to group only once
  useEffect(() => {
    if (!clonedScene || !modelRef.current || sceneAddedRef.current) return;

    modelRef.current.add(clonedScene);
    sceneAddedRef.current = true;
  }, [clonedScene]);

  // Update material color when selection changes (without reloading model)
  useEffect(() => {
    if (!meshRef.current) return;

    const colorMap: { [key: string]: string } = {
      black: "#000000",
      white: "#FFFFFF",
    };

    meshRef.current.material = new THREE.MeshStandardMaterial({
      color: selectedPrint ? "#FFFFFF" : colorMap[selectedColor] || "#FFFFFF",
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [selectedPrint, selectedColor]);

  // Configure texture
  useEffect(() => {
    if (texture) {
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Gentle rotation animation
  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={modelRef} position={[0, -1, 0]} scale={1.5}>
      <primitive object={scene} />
      {selectedPrint && meshRef.current && texture && (
        <Decal
          position={[0, 0.9, 0.51]}
          rotation={[0, Math.PI, Math.PI]}
          scale={0.9}
          mesh={meshRef as React.RefObject<THREE.Mesh>}
        >
          <meshStandardMaterial
            map={texture}
            transparent
            polygonOffset
            polygonOffsetFactor={-1}
            roughness={0.8}
          />
        </Decal>
      )}
    </group>
  );
}

interface TShirtSceneProps {
  selectedPrint: PrintDesign | null;
  selectedColor: string;
}

export default function TShirtScene({
  selectedPrint,
  selectedColor,
}: TShirtSceneProps) {
  return (
    <div className="w-full h-full min-h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense
          fallback={
            <Html center>
              <Loader />
            </Html>
          }
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.6} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.2} />
          <spotLight
            position={[0, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={0.3}
            castShadow
          />

          <Environment preset="studio" />

          <TShirtModel
            selectedPrint={selectedPrint}
            selectedColor={selectedColor}
          />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={8}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
      </Canvas>

      <div className="absolute top-4 left-4 text-sm text-gray-500">
        {selectedPrint ? `Print: ${selectedPrint.name}` : "Select a print"}
      </div>
    </div>
  );
}

useGLTF.preload("/model/compressed/base.glb");
