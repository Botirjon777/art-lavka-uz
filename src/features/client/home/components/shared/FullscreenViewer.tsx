"use client";

import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { LuX } from "react-icons/lu";
import { TShirtModel, TShirtModelProps } from "./TShirtModel";
import Loader from "@/components/Loader";
import { useTranslation } from "@/hooks/useTranslation";

interface FullscreenViewerProps extends TShirtModelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FullscreenViewer({
  isOpen,
  onClose,
  selectedPrint,
  selectedColor,
  selectedProduct,
}: FullscreenViewerProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-210 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-95 group cursor-pointer"
      >
        <LuX
          size={32}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      </button>

      {/* Main Canvas Container */}
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 40 }}
          gl={{
            antialias: true,
            alpha: true,
          }}
          dpr={[1, 2]}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <Suspense
            fallback={
              <Html center>
                <div className="scale-150">
                  <Loader />
                </div>
              </Html>
            }
          >
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.6}
              castShadow
            />
            <directionalLight position={[-10, -10, -5]} intensity={0.2} />
            <spotLight
              position={[0, 8, 8]}
              angle={0.3}
              penumbra={1}
              intensity={0.5}
            />

            <Environment files="/model/hdr/studio_small_01_1k.hdr" />

            <TShirtModel
              selectedProduct={selectedProduct}
              selectedPrint={selectedPrint}
              selectedColor={selectedColor}
              modelScale={1.5} // Larger scale for fullscreen
              modelPosition={[0, -1.2, 0]}
            />

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={3}
              maxDistance={12}
            />
          </Suspense>
        </Canvas>

        {/* Floating Info */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 text-[10px] uppercase font-black tracking-widest text-center">
          <span>{t.rotateModel}</span>
          <span>{t.zoomScroll}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
