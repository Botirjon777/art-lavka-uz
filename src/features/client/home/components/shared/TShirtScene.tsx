"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { PrintDesign } from "@/types";
import Loader from "@/components/Loader";
import { AiFillQuestionCircle } from "react-icons/ai";
import { Tooltip } from "@/components/ui";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LuMaximize } from "react-icons/lu";
import FullscreenViewer from "./FullscreenViewer";
import { TShirtModel } from "./TShirtModel";
import Modal from "@/components/Modal";
import MobileModal from "@/features/client/home/modals/mobile/MobileModal";
import { FiX } from "react-icons/fi";

interface TShirtSceneProps {
  selectedProduct?: string;
  productName?: string;
  productDescription?: string;
  selectedPrint: PrintDesign | null;
  selectedColor: string;
  onProductClick?: () => void;
  onPrintClick?: () => void;
  onGalleryClick?: () => void;
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
  onGalleryClick,
  showUI = true,
  modelScale = 1.5,
  modelPosition = [0, -0.6, 0],
  cameraPosition = [0, 0, 5],
}: TShirtSceneProps) {
  const isMobile = useIsMobile();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);

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
          {/* Modals for product description */}
          {isMobile ? (
            <MobileModal
              isOpen={isDescModalOpen}
              onClose={() => setIsDescModalOpen(false)}
              title={productName}
            >
              <div className="flex flex-col h-full bg-white">
                <div className="px-6 py-4 flex-1">
                  <div className="inline-block px-3 py-1 bg-[#8814B1]/10 rounded-full mb-4">
                    <span className="text-[12px] font-bold text-[#8814B1] uppercase tracking-wider">
                      Oписание товара
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#333333] mb-6">
                    {productName}
                  </h2>
                  <div className="prose prose-sm max-w-none text-[#666666] leading-relaxed text-[15px]">
                    {productDescription || "Нет описания."}
                  </div>
                </div>
              </div>
            </MobileModal>
          ) : (
            <Modal
              isOpen={isDescModalOpen}
              onClose={() => setIsDescModalOpen(false)}
              showBackgroundImage={false}
            >
              <div className="w-[600px] max-w-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    <div className="inline-block px-3 py-1 bg-[#8814B1]/10 rounded-full">
                      <span className="text-[12px] font-bold text-[#8814B1] uppercase tracking-wider">
                        Oписание товара
                      </span>
                    </div>
                    <h2 className="text-[32px]/[40px] font-bold text-[#333333]">
                      {productName}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDescModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <FiX size={28} />
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1 bg-linear-to-b from-[#8814B1] to-[#00C6F1] rounded-full opacity-20" />
                  <div className="text-[17px]/[28px] text-[#555555] whitespace-pre-wrap font-medium">
                    {productDescription || "Нет описания."}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setIsDescModalOpen(false)}
                    className="px-8 py-3 bg-[#333333] text-white rounded-xl hover:bg-[#333333]/90 transition-all font-medium cursor-pointer"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {isMobile && (
            <div className="absolute w-full bottom-0 left-0">
              {/* Product Name */}
              <div className="px-4 py-3 text-center flex justify-center">
                <div
                  onClick={() => setIsDescModalOpen(true)}
                  className="text-[13px]/[16px] text-[#333333] flex items-center gap-2 cursor-pointer"
                >
                  {productName}
                  <AiFillQuestionCircle size={18} className="text-[#666666]" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 px-5 pb-8">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onPrintClick}
                    className="py-[12px] bg-[#00C6F1] rounded-xl text-[12px] text-white hover:bg-[#00C6F1]/90 active:scale-95 transition-all shadow-sm font-bold"
                  >
                    Выбрать принт
                  </button>
                  {onProductClick && (
                    <button
                      onClick={onProductClick}
                      className="py-[12px] bg-white rounded-xl text-[12px] text-[#333333] hover:bg-gray-50 active:scale-95 transition-all shadow-sm border border-gray-100"
                    >
                      Выбрать продукт
                    </button>
                  )}
                </div>
                <button
                  onClick={onGalleryClick}
                  className="w-full py-[12px] bg-white/80 backdrop-blur-sm rounded-xl text-[12px] text-[#333333] hover:bg-white active:scale-95 transition-all shadow-sm border border-gray-100 font-medium"
                >
                  Смотреть галерею
                </button>
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="hidden xl:flex absolute w-full bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center gap-5">
              <div
                onClick={() => setIsDescModalOpen(true)}
                className="text-[16px]/[20px] underline text-[#333333] flex items-center gap-[5px] cursor-pointer"
              >
                {productName}{" "}
                <AiFillQuestionCircle
                  size={20}
                  className="text-gray-400 group-hover:text-white"
                />
              </div>
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
