"use client";

import { useAdminProducts, useDeleteProduct } from "../hooks/useProducts";
import Link from "next/link";
import Image from "next/image";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { Product } from "../types";
import Loader from "@/components/Loader";

export default function ProductList() {
  const { data: products = [], isLoading: loading } = useAdminProducts();
  const deleteMutation = useDeleteProduct();

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) return;
    deleteMutation.mutate(id);
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
        <Loader />
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
              {products.map((product: Product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">
                            {product.name}
                          </p>
                          {product.isDefault && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-md uppercase tracking-wider whitespace-nowrap">
                              По умолчанию
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const categoryMap: { [key: string]: { label: string; color: string } } = {
                        women: { label: "Женское", color: "bg-purple-100 text-purple-700" },
                        men: { label: "Мужское", color: "bg-blue-100 text-blue-700" },
                        kids: { label: "Детское", color: "bg-orange-100 text-orange-700" },
                      };
                      const cat = categoryMap[product.category] || { label: product.category, color: "bg-gray-100 text-gray-700" };
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      );
                    })()}
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
