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
    { id: "women" as const, label: "Женский", sublabel: "Скоро" },
    { id: "men" as const, label: "Мужской", sublabel: "Скоро" },
    { id: "kids" as const, label: "Детский", sublabel: "Скоро" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px]">
        <h2 className="text-[24px] font-bold text-[#333333] mb-6">Галерея</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label} -{" "}
              <span className="text-purple-600">{tab.sublabel}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelectProduct(product);
                onClose();
              }}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 hover:border-purple-400"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-800 font-medium truncate">
                  {product.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
