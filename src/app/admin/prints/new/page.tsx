"use client";

import { useState } from "react";
import { createPrint } from "@/app/actions/prints";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function NewPrintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");

  const handleFrontImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFront(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setFrontImageUrl(data.url);
        toast.success("Front image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload front image");
      }
    } catch (error) {
      toast.error("Failed to upload front image");
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBack(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setBackImageUrl(data.url);
        toast.success("Back image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload back image");
      }
    } catch (error) {
      toast.error("Failed to upload back image");
    } finally {
      setUploadingBack(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("frontImage", frontImageUrl);
    if (backImageUrl) {
      formData.set("backImage", backImageUrl);
    }

    const result = await createPrint(formData);

    if (result.success) {
      toast.success("Print created successfully");
      router.push("/admin/prints");
    } else {
      toast.error(result.error || "Failed to create print");
    }

    setLoading(false);
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Print</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[20px] p-8 shadow-sm space-y-6"
      >
        {/* Front Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Front Image *
          </label>
          <div className="flex items-start gap-4">
            {frontImageUrl && (
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={frontImageUrl}
                  alt="Front Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFrontImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8814B1] file:text-white hover:file:bg-[#8814B1]/90"
                disabled={uploadingFront}
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Back Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Back Image (Optional)
          </label>
          <div className="flex items-start gap-4">
            {backImageUrl && (
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={backImageUrl}
                  alt="Back Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8814B1] file:text-white hover:file:bg-[#8814B1]/90"
                disabled={uploadingBack}
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 5MB (leave empty for front-only print)
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Print Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            placeholder="Пузатый котик"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
          >
            <option value="national">National</option>
            <option value="stylish">Stylish</option>
            <option value="funny">Funny</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            name="active"
            value="true"
            defaultChecked
            className="w-4 h-4 text-[#8814B1] border-gray-300 rounded focus:ring-[#8814B1]"
          />
          <label htmlFor="active" className="text-sm font-medium text-gray-700">
            Active (visible to customers)
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !frontImageUrl}
            className="flex-1 py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Print"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
