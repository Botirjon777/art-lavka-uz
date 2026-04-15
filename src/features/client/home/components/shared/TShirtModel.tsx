"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Decal, Html } from "@react-three/drei";
import * as THREE from "three";
import { PrintDesign } from "@/types";

// Global texture cache to prevent re-loading and re-uploading to GPU
const textureCache: { [url: string]: THREE.Texture } = {};

export interface TShirtModelProps {
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  selectedProduct?: string;
  modelScale?: number;
  modelPosition?: [number, number, number];
}

export function TShirtModel({
  selectedPrint,
  selectedColor,
  selectedProduct,
  modelScale = 1.5,
  modelPosition = [0, -1, 0],
}: TShirtModelProps) {
  const { scene } = useGLTF(selectedProduct || "/model/compressed/base.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [frontTexture, setFrontTexture] = useState<THREE.Texture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.Texture | null>(null);
  const [isLoadingTextures, setIsLoadingTextures] = useState(false);

  // Load front and back textures
  useEffect(() => {
    if (!selectedPrint) {
      setFrontTexture(null);
      setBackTexture(null);
      setIsLoadingTextures(false);
      return;
    }

    const loadTexture = (
      url: string,
      setTexture: (t: THREE.Texture) => void,
    ): Promise<void> => {
      if (textureCache[url]) {
        setTexture(textureCache[url]);
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(url, (loadedTexture) => {
          loadedTexture.flipY = false;
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture.needsUpdate = true;
          textureCache[url] = loadedTexture;
          setTexture(loadedTexture);
          resolve();
        });
      });
    };

    setIsLoadingTextures(true);

    const taskPromises: Promise<void>[] = [];

    // Check if we actually need to show the loader
    const needsLoading = !!(
      !textureCache[selectedPrint.frontImage] ||
      (selectedPrint.backImage && !textureCache[selectedPrint.backImage])
    );

    setIsLoadingTextures(needsLoading);

    taskPromises.push(loadTexture(selectedPrint.frontImage, setFrontTexture));
    if (selectedPrint.backImage) {
      taskPromises.push(loadTexture(selectedPrint.backImage, setBackTexture));
    } else {
      setBackTexture(null);
    }

    Promise.all(taskPromises).finally(() => {
      setIsLoadingTextures(false);
    });
  }, [selectedPrint]);

  // Find and store mesh reference only once (from the cloned scene)
  useEffect(() => {
    if (meshRef.current || !clonedScene) return;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && !meshRef.current) {
        meshRef.current = child;
      }
    });
  }, [clonedScene]);

  // Update material color when selection changes (without reloading model)
  useEffect(() => {
    if (!meshRef.current) return;

    meshRef.current.material = new THREE.MeshStandardMaterial({
      color: selectedColor || "#FFFFFF",
      roughness: 0.8,
      metalness: 0.1,
    });
  }, [selectedPrint, selectedColor]);

  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <>
      <group ref={groupRef} position={modelPosition} scale={modelScale}>
        <primitive object={clonedScene} />
        {selectedPrint && meshRef.current && (
          <>
            {/* Front print */}
            {frontTexture && (
              <Decal
                position={[-0.05, 0.9, 0.6]}
                rotation={[0, Math.PI, Math.PI]}
                scale={0.9}
                mesh={meshRef as React.RefObject<THREE.Mesh>}
              >
                <meshStandardMaterial
                  map={frontTexture}
                  transparent
                  polygonOffset
                  polygonOffsetFactor={-1}
                  roughness={0.8}
                />
              </Decal>
            )}

            {/* Back print - only render if backImage exists */}
            {backTexture && (
              <Decal
                position={[-0.05, 0.9, -0.6]}
                rotation={[0, 0, Math.PI]}
                scale={0.9}
                mesh={meshRef as React.RefObject<THREE.Mesh>}
              >
                <meshStandardMaterial
                  map={backTexture}
                  transparent
                  polygonOffset
                  polygonOffsetFactor={-1}
                  roughness={0.8}
                />
              </Decal>
            )}
          </>
        )}
      </group>

      {/* Loading overlay */}
      {isLoadingTextures && (
        <Html center>
          <div className="flex flex-col items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 bg-[#00C6F1] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#00C6F1] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#00C6F1] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <p className="text-sm font-medium text-[#333333]">
              Наносим принт...
            </p>
          </div>
        </Html>
      )}
    </>
  );
}

useGLTF.preload("/model/compressed/base.glb");
