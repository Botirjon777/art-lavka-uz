"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
} from "@react-three/drei";
import { PrintDesign } from "@/types";
import Loader from "@/components/Loader";
import { AiFillQuestionCircle } from "react-icons/ai";
import { Tooltip } from "@/components/ui";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LuMaximize } from "react-icons/lu";
import FullscreenViewer from "./FullscreenViewer";
import { TShirtModel } from "./TShirtModel";

interface TShirtSceneProps {
  selectedProduct?: string;
  productName?: string;
  productDescription?: string;
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  onProductClick?: () => void;
  onPrintClick?: () => void;
  showUI?: boolean;
  modelScale?: number;
  modelPosition?: [number, number, number];
  cameraPosition?: [number, number, number];
}

export default function TShirtScene({
  selectedProduct,
  productName = "Продукт",
  productDescription = "",
  selectedPrint,
  selectedColor,
  onProductClick,
  onPrintClick,
  showUI = true,
  modelScale = 1.5,
  modelPosition = [0, -1, 0],
  cameraPosition = [0, 0, 5],
}: TShirtSceneProps) {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden">
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="absolute inset-0 w-full h-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
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
            modelScale={modelScale}
            modelPosition={modelPosition}
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

      {/* Zoom Button */}
      <button
        onClick={() => setIsFullscreen(true)}
        className="absolute top-4 right-4 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full text-[#333333] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg group"
        title="Развернуть"
      >
        <LuMaximize size={22} className="group-hover:text-[#00C6F1]" />
      </button>

      {isFullscreen && (
        <FullscreenViewer
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          selectedProduct={selectedProduct}
          selectedPrint={selectedPrint}
          selectedColor={selectedColor}
        />
      )}

      {showUI && (
        <>
          {isMobile && (
            <div className="absolute w-full bottom-0 left-0">
              {/* Product Name */}
              <div className="px-4 py-3 text-center flex justify-center">
                <Tooltip content={productDescription} position="top">
                  <div className="text-[13px]/[16px] text-[#333333] flex items-center gap-2 cursor-help">
                    {productName}
                    <AiFillQuestionCircle
                      size={18}
                      className="text-[#666666]"
                    />
                  </div>
                </Tooltip>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2.5 px-5">
                <button
                  onClick={onPrintClick}
                  className="py-[15px] bg-white rounded-xl text-[13px]/[16px] text-[#333333] hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Выбрать принт
                </button>
                {onProductClick && (
                  <button
                    onClick={onProductClick}
                    className="py-[15px] bg-white rounded-xl text-[13px]/[16px] text-[#333333] hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    Выбрать продукт
                  </button>
                )}
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="hidden xl:flex absolute w-full bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center gap-5">
              <Tooltip content={productDescription} position="top">
                <div className="text-[16px]/[20px] underline text-[#333333] flex items-center gap-[5px] cursor-help">
                  {productName}{" "}
                  <AiFillQuestionCircle
                    size={20}
                    className="text-gray-400 group-hover:text-white"
                  />
                </div>
              </Tooltip>
              {onProductClick && (
                <button
                  onClick={onProductClick}
                  className="text-[16px]/[20px] py-[15px] px-[35px] cursor-pointer rounded-xl bg-white text-[#333333] hover:text-[#333333]/80"
                >
                  Выбрать продукт
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
