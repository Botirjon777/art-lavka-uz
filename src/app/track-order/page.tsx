"use client";

import { useState } from "react";
import { trackOrder } from "@/app/actions/trackOrder";
import { Order } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  MdPending,
  MdCheckCircle,
  MdSettings,
  MdLocalShipping,
  MdCancel,
} from "react-icons/md";
import { IconType } from "react-icons";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderNumber || !phone) {
      setError("Please enter both order number and phone number");
      return;
    }

    setLoading(true);
    const result = await trackOrder(orderNumber, phone);

    if (result.success && result.order) {
      setOrder(result.order);
    } else {
      setError(result.error || "Order not found");
    }
    setLoading(false);
  };

  const getStatusInfo = (
    status: string
  ): { label: string; color: string; icon: IconType } => {
    const statusInfo: Record<
      string,
      { label: string; color: string; icon: IconType }
    > = {
      pending: { label: "Pending", color: "bg-yellow-500", icon: MdPending },
      confirmed: {
        label: "Confirmed",
        color: "bg-blue-500",
        icon: MdCheckCircle,
      },
      processing: {
        label: "Processing",
        color: "bg-purple-500",
        icon: MdSettings,
      },
      shipped: {
        label: "Shipped",
        color: "bg-indigo-500",
        icon: MdLocalShipping,
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-500",
        icon: MdCheckCircle,
      },
      cancelled: { label: "Cancelled", color: "bg-red-500", icon: MdCancel },
    };
    return statusInfo[status as keyof typeof statusInfo] || statusInfo.pending;
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = steps.indexOf(currentStatus);

    if (currentStatus === "cancelled") {
      return steps.map((step, index) => ({
        ...getStatusInfo(step),
        active: false,
        completed: false,
      }));
    }

    return steps.map((step, index) => ({
      ...getStatusInfo(step),
      active: index === currentIndex,
      completed: index < currentIndex,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/art-lavka.png"
              alt="ART LAVKA.UZ"
              width={200}
              height={75}
              className="object-contain"
            />
          </Link>
          <h1 className="text-3xl font-bold text-[#333333] mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your order details to check the status
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-[30px] p-8 shadow-lg mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1] uppercase"
                placeholder="ORD-XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6F1]"
                placeholder="+998 XX XXX XX XX"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00C6F1] text-white rounded-lg hover:bg-[#00C6F1]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Tracking..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-[30px] p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#333333] mb-6">
                Order Status
              </h2>

              {order.status === "cancelled" ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MdCancel size={48} className="text-red-600" />
                  </div>
                  <p className="text-xl font-bold text-red-600 mb-2">
                    Order Cancelled
                  </p>
                  <p className="text-gray-600">This order has been cancelled</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-10 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="h-full bg-[#00C6F1] transition-all duration-500"
                      style={{
                        width: `${
                          (getStatusSteps(order.status).filter(
                            (s) => s.completed
                          ).length /
                            4) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Status Steps */}
                  <div className="relative flex justify-between">
                    {getStatusSteps(order.status).map((step, index) => {
                      const IconComponent = step.icon;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                              step.active
                                ? `${step.color} text-white scale-110 shadow-lg`
                                : step.completed
                                ? "bg-[#00C6F1] text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            <IconComponent size={32} />
                          </div>
                          <p
                            className={`text-sm font-medium ${
                              step.active ? "text-[#00C6F1]" : "text-gray-600"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-[30px] p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#333333] mb-6">
                Order Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-bold text-[#00C6F1]">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-lg">
                    {order.totalAmount.toLocaleString()} UZS
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-lg mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                        {item.print && (
                          <p className="text-sm text-[#00C6F1]">
                            Print: {item.print.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(item.price * item.quantity).toLocaleString()} UZS
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-[30px] p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-[#333333] mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-medium">{order.customerAddress}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="font-medium">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-[#333333] rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
