"use client";

import { useState, useEffect } from "react";
import { getProducts, deleteProduct } from "../actions/products";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { Product } from "../types";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) return;

    const result = await deleteProduct(id);
    if (result.success) {
      toast.success("Продукт успешно удален");
      loadProducts();
    } else {
      toast.error("Не удалось удалить продукт");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Продукты</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          Добавить продукт
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Загрузка продуктов...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center shadow-sm">
          <p className="text-gray-600 mb-4">Продукты не найдены</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Добавить первый продукт
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Продукт
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Категория
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Цена
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Склад
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Статус
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {product.price.toLocaleString()} сум
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        product.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.active ? "Активный" : "Неактивный"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
