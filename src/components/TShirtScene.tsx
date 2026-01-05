"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Decal,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { PrintDesign, Product } from "@/types";
import Loader from "./Loader";
import { AiFillQuestionCircle } from "react-icons/ai";
import { TbRotate3D } from "react-icons/tb";

interface TShirtModelProps {
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  selectedProduct?: string;
}

function TShirtModel({
  selectedPrint,
  selectedColor,
  selectedProduct,
}: TShirtModelProps) {
  const { scene } = useGLTF(selectedProduct || "/model/compressed/base.glb");
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture manually without triggering Suspense
  useEffect(() => {
    if (!selectedPrint) {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(selectedPrint.image, (loadedTexture) => {
      loadedTexture.flipY = false;
      loadedTexture.colorSpace = THREE.SRGBColorSpace;
      loadedTexture.needsUpdate = true;
      setTexture(loadedTexture);
    });
  }, [selectedPrint]);

  // Find and store mesh reference only once
  useEffect(() => {
    if (meshRef.current || !scene) return;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !meshRef.current) {
        meshRef.current = child;
      }
    });
  }, [scene]);

  // Update material color when selection changes (without reloading model)
  useEffect(() => {
    if (!meshRef.current) return;

    const colorMap: { [key: string]: string } = {
      white: "#FFFFFF",
      black: "#000000",
      red: "#EF4444",
      blue: "#3B82F6",
      green: "#10B981",
      yellow: "#FBBF24",
      gray: "#9CA3AF",
      "off-white": "#FAF9F6",
    };

    meshRef.current.material = new THREE.MeshStandardMaterial({
      color: colorMap[selectedColor] || "#FFFFFF",
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
    <group ref={groupRef} position={[0, -1, 0]} scale={1.5}>
      <primitive object={scene} />
      {selectedPrint && meshRef.current && texture && (
        <Decal
          position={[-0.05, 0.9, 0.6]}
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
  selectedProduct?: string;
  productName?: string;
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  onProductClick?: () => void;
  showUI?: boolean;
}

export default function TShirtScene({
  selectedProduct,
  productName = "Продукт",
  selectedPrint,
  selectedColor,
  onProductClick,
  showUI = true,
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
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={0.4} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.15} />
          <spotLight
            position={[0, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={0.2}
            castShadow
          />

          <Environment files="/model/hdr/studio_small_01_1k.hdr" />

          <TShirtModel
            selectedProduct={selectedProduct}
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

      {showUI && (
        <>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
            <TbRotate3D size={32} className="text-[#00C6F1]" />
          </div>

          <div className="absolute w-full bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-5">
            <p className="text-[16px]/[20px] text-[#333333] flex items-center gap-[5px]">
              {productName}{" "}
              <AiFillQuestionCircle size={20} className="text-white" />
            </p>
            <button
              onClick={onProductClick}
              className="text-[16px]/[20px] py-[15px] px-[35px] rounded-xl bg-white text-[#333333] hover:text-[#333333]/80"
            >
              Выбрать продукт
            </button>
          </div>
        </>
      )}
    </div>
  );
}

useGLTF.preload("/model/compressed/base.glb");
