"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Product } from "@/types";
import Image from "next/image";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

// Mock product data
const products: Product[] = [
  {
    id: "1",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-1.png",
    category: "women",
    price: 100000,
  },
  {
    id: "2",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-2.png",
    category: "women",
    price: 100000,
  },
  {
    id: "3",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-3.png",
    category: "women",
    price: 100000,
  },
  {
    id: "4",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-4.png",
    category: "women",
    price: 100000,
  },
  {
    id: "5",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-5.png",
    category: "women",
    price: 100000,
  },
  {
    id: "6",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-6.png",
    category: "women",
    price: 100000,
  },
  {
    id: "7",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-7.png",
    category: "women",
    price: 100000,
  },
  {
    id: "8",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-8.png",
    category: "women",
    price: 100000,
  },
  {
    id: "9",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-9.png",
    category: "women",
    price: 100000,
  },
  {
    id: "10",
    name: "Футболка овер сайз",
    image: "/products/tshirt-white-classic-10.png",
    category: "women",
    price: 100000,
  },
];

export default function GalleryModal({
  isOpen,
  onClose,
  onSelectProduct,
}: GalleryModalProps) {
  const [activeTab, setActiveTab] = useState<"women" | "men" | "kids">("women");

  const tabs = [
    { id: "women" as const, label: "Женский", soon: false },
    { id: "men" as const, label: "Мужской", soon: true },
    { id: "kids" as const, label: "Детский", soon: true },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px]">
        <h2 className="text-[30px]/[37px] text-[#333333] mb-7.5">Галерея</h2>

        {/* Tabs */}
        <div className="flex gap-10 mb-7.5 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`transition-colors cursor-pointer relative ${
                activeTab === tab.id ? "border-b-2 border-[#333333]" : ""
              } ${tab.soon ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={tab.soon}
            >
              {tab.label}
              {tab.soon && <span className="text-[#8814B1]"> - Скоро</span>}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelectProduct(product);
                onClose();
              }}
              className="group text-center"
            >
              <div className="relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={210}
                  height={200}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-[16px]/[22px] text-[#333333]">
                {product.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
