"use client";

import { useState, useEffect } from "react";
import { getPrints, deletePrint } from "@/app/actions/prints";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

interface Print {
  _id: string;
  name: string;
  frontImage: string;
  backImage?: string;
  category: string;
  active: boolean;
}

export default function PrintsPage() {
  const [prints, setPrints] = useState<Print[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadPrints();
  }, []);

  const loadPrints = async () => {
    setLoading(true);
    const data = await getPrints();
    setPrints(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this print?")) return;

    const result = await deletePrint(id);
    if (result.success) {
      toast.success("Print deleted successfully");
      loadPrints();
    } else {
      toast.error("Failed to delete print");
    }
  };

  const filteredPrints =
    filter === "all" ? prints : prints.filter((p) => p.category === filter);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Prints</h1>
        <Link
          href="/admin/prints/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all shadow-lg"
        >
          <FiPlus className="w-5 h-5" />
          Add Print
        </Link>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6">
        {["all", "national", "stylish", "funny"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === cat
                ? "bg-[#8814B1] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading prints...</p>
        </div>
      ) : filteredPrints.length === 0 ? (
        <div className="bg-white rounded-[20px] p-12 text-center shadow-sm">
          <p className="text-gray-600 mb-4">No prints found</p>
          <Link
            href="/admin/prints/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all"
          >
            <FiPlus className="w-5 h-5" />
            Add Your First Print
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredPrints.map((print) => (
            <div
              key={print._id}
              className="bg-white rounded-[20px] p-4 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                <Image
                  src={print.frontImage}
                  alt={print.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/prints/${print._id}/edit`}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiEdit className="w-5 h-5 text-blue-600" />
                  </Link>
                  <button
                    onClick={() => handleDelete(print._id)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-800 truncate">
                  {print.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                    {print.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      print.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {print.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
