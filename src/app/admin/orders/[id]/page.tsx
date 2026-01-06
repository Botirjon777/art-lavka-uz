"use client";

import { useState, useEffect } from "react";
import { getOrderById, updateOrderStatus } from "@/app/actions/orders";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";
import { Order, OrderStatus, PaymentStatus } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadOrder();
    }
  }, [params.id]);

  const loadOrder = async () => {
    setLoading(true);
    const data = await getOrderById(params.id as string);
    setOrder(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (status: OrderStatus) => {
    if (!order) return;

    setUpdating(true);
    const result = await updateOrderStatus(order._id!, status);

    if (result.success) {
      toast.success("Order status updated");
      setOrder(result.order);
    } else {
      toast.error(result.error || "Failed to update status");
    }
    setUpdating(false);
  };

  const handlePaymentStatusUpdate = async (paymentStatus: PaymentStatus) => {
    if (!order) return;

    setUpdating(true);
    const result = await updateOrderStatus(
      order._id!,
      order.status,
      paymentStatus
    );

    if (result.success) {
      toast.success("Payment status updated");
      setOrder(result.order);
    } else {
      toast.error(result.error || "Failed to update payment status");
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Order not found</p>
        <Link
          href="/admin/orders"
          className="text-[#8814B1] hover:text-[#8814B1]/80"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <p className="text-gray-600">{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.size} • {item.color}
                    </p>
                    {item.print && (
                      <p className="text-sm text-gray-600">
                        Print:{" "}
                        <span className="text-[#00C6F1]">
                          {item.print.name}
                        </span>
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} UZS
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-[#8814B1]">
                  {order.totalAmount.toLocaleString()} UZS
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">
                  Delivery Address
                </label>
                <p className="font-medium">{order.customerAddress}</p>
              </div>
              {order.notes && (
                <div>
                  <label className="text-sm text-gray-600">Notes</label>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Status</h2>
            <select
              value={order.status}
              onChange={(e) =>
                handleStatusUpdate(e.target.value as OrderStatus)
              }
              disabled={updating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Payment Status</h2>
            <select
              value={order.paymentStatus}
              onChange={(e) =>
                handlePaymentStatusUpdate(e.target.value as PaymentStatus)
              }
              disabled={updating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8814B1] disabled:opacity-50"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="font-medium">
                  {new Date(order.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
