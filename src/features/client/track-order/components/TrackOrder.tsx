"use client";

import { useState } from "react";
import { trackOrder, getOrdersByPhone } from "../actions/trackOrder";
import { Order } from "@/types";
import Image from "next/image";
import NextLink from "next/link";
import {
  MdPending,
  MdCheckCircle,
  MdSettings,
  MdLocalShipping,
  MdCancel,
  MdSearch,
  MdInfoOutline,
} from "react-icons/md";
import { IconType } from "react-icons";
import { RiTelegram2Line, RiArrowRightSLine, RiArrowLeftLine } from "react-icons/ri";
import { normalizePhoneNumber, applyPhoneMask } from "@/lib/phoneUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { LOCATIONS } from "@/lib/i18n/locations";

export default function TrackOrder() {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchMode, setSearchMode] = useState<"order-number" | "phone-only">(
    "order-number"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setOrdersList([]);

    if (searchMode === "order-number") {
      if (!orderNumber || !phone) {
        setError(t.errorEnterOrderAndPhone);
        return;
      }

      setLoading(true);
      const normalizedPhone = normalizePhoneNumber(phone);
      const result = await trackOrder(orderNumber, normalizedPhone);

      if (result.success && result.order) {
        setOrder(result.order);
      } else {
        setError(result.error || t.errorOrderNotFound);
      }
      setLoading(false);
    } else {
      if (!phone) {
        setError(t.errorEnterPhone);
        return;
      }

      setLoading(true);
      const normalizedPhone = normalizePhoneNumber(phone);
      const result = await getOrdersByPhone(normalizedPhone);

      if (result.success && result.orders) {
        setOrdersList(result.orders);
      } else {
        setError(result.error || t.errorOrdersNotFound);
      }
      setLoading(false);
    }
  };

  const getStatusInfo = (
    status: string
  ): { label: string; color: string; bg: string; text: string; icon: IconType } => {
    const statusInfo: Record<
      string,
      { label: string; color: string; bg: string; text: string; icon: IconType }
    > = {
      pending: {
        label: t.orderStatus.pending,
        color: "#EAB308",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        icon: MdPending,
      },
      confirmed: {
        label: t.orderStatus.confirmed,
        color: "#3B82F6",
        bg: "bg-blue-50",
        text: "text-blue-700",
        icon: MdCheckCircle,
      },
      processing: {
        label: t.orderStatus.processing,
        color: "#A855F7",
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: MdSettings,
      },
      shipped: {
        label: t.orderStatus.shipped,
        color: "#6366F1",
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        icon: MdLocalShipping,
      },
      delivered: {
        label: t.orderStatus.delivered,
        color: "#22C55E",
        bg: "bg-green-50",
        text: "text-green-700",
        icon: MdCheckCircle,
      },
      cancelled: {
        label: t.orderStatus.cancelled,
        color: "#EF4444",
        bg: "bg-red-50",
        text: "text-red-700",
        icon: MdCancel,
      },
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

    return steps.map((step, index) => ({
      ...getStatusInfo(step),
      active: index === currentIndex,
      completed: index < currentIndex,
    }));
  };

  const handleSelectOrder = async (orderItem: Order) => {
    setLoading(true);
    setError("");
    const result = await trackOrder(orderItem.orderNumber, phone);

    if (result.success && result.order) {
      setOrder(result.order);
      setOrdersList([]);
    } else {
      setError(t.errorLoadOrderDetails);
    }
    setLoading(false);
  };

  const getTranslatedVillage = (region: string, villageRu: string) => {
    const districts = LOCATIONS[region as keyof typeof LOCATIONS] || [];
    const district = districts.find((d) => d.ru === villageRu);
    if (!district) return villageRu;
    return district[lang as keyof typeof district] || district.ru;
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE] py-12 px-6 flex flex-col">
      <div className="max-w-4xl w-full mx-auto my-auto">
        {/* Header Section */}
        <div className="relative text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <NextLink
            href="/"
            className="absolute left-0 top-0 flex items-center gap-2 px-4 py-2 bg-white text-gray-500 border border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xs active:scale-95 group"
          >
            <RiArrowLeftLine size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-sm">{t.backToHome}</span>
          </NextLink>

          <NextLink href="/" className="inline-block mb-10 transform hover:scale-105 transition-transform">
            <Image
              src="/art-lavka.png"
              alt="ART LAVKA"
              width={220}
              height={80}
              className="object-contain"
            />
          </NextLink>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            {t.trackOrderTitle}
          </h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
            {t.trackOrderDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <a
                href="https://t.me/artlavkauzbot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[#0088cc] text-white rounded-2xl font-bold hover:bg-[#0077b5] transition-all shadow-lg shadow-blue-100"
              >
                <RiTelegram2Line size={20} />
                {t.telegramBot}
              </a>
             <button 
                onClick={() => {
                   setOrder(null);
                   setOrdersList([]);
                   setSearchMode(searchMode === 'phone-only' ? 'order-number' : 'phone-only');
                }}
                className="text-sm font-bold text-[#8814B1] hover:underline px-4 py-2"
             >
                {searchMode === 'phone-only' ? t.findByOrderNumber : t.findByPhone}
             </button>
          </div>
        </div>

        {/* Search Engine */}
        {!order && ordersList.length === 0 && (
          <div className="bg-white rounded-[48px] p-12 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.06)] border border-gray-50 animate-in fade-in zoom-in-95 duration-500">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {searchMode === "order-number" && (
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      {t.yourOrderNumber}
                    </label>
                    <div className="relative group">
                       <MdInfoOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#8814B1] transition-colors" size={20} />
                       <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] outline-none transition-all font-black text-gray-900 uppercase placeholder:text-gray-300 tracking-wider"
                        placeholder="ORD-7CHARS"
                      />
                    </div>
                  </div>
                )}
                
                <div className={`${searchMode === "phone-only" ? 'md:col-span-2' : ''} space-y-3`}>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    {t.phoneNumberLabel}
                  </label>
                  <div className="relative group">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-[#8814B1] transition-colors">+998</span>
                     <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-purple-50 focus:border-[#8814B1] outline-none transition-all font-black text-gray-900 placeholder:text-gray-300"
                      placeholder="XX XXX XX XX"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-5 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold text-sm">
                  <MdCancel size={20} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-gray-900 hover:bg-[#8814B1] text-white rounded-[26px] transition-all font-black text-xl shadow-2xl shadow-gray-200 hover:shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <MdSearch size={28} className="group-hover:rotate-12 transition-transform" />
                    {searchMode === "phone-only" ? t.showOrderHistory : t.checkStatus}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* List of Orders Discovery */}
        {ordersList.length > 0 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-black text-gray-900">{t.yourOrders} ({ordersList.length})</h2>
               <button onClick={() => setOrdersList([])} className="text-gray-400 hover:text-gray-900 font-bold text-sm flex items-center gap-1">
                  <RiArrowLeftLine /> {t.backToSearch}
               </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {ordersList.map((orderItem) => {
                const status = getStatusInfo(orderItem.status);
                const Icon = status.icon;
                return (
                  <button
                    key={orderItem._id}
                    onClick={() => handleSelectOrder(orderItem)}
                    className="group w-full p-8 bg-white hover:bg-purple-50/30 rounded-[32px] transition-all border border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 ${status.bg} ${status.text} rounded-2xl flex items-center justify-center shadow-sm`}>
                         <Icon size={32} />
                      </div>
                      <div>
                        <p className="text-xl font-black text-gray-900 group-hover:text-[#8814B1] transition-colors">{orderItem.orderNumber}</p>
                        <p className="text-sm font-bold text-gray-400 tracking-tight">{t.created} {new Date(orderItem.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-10">
                       <div className="text-right">
                          <p className="text-lg font-black text-gray-900">{orderItem.totalAmount.toLocaleString()} {t.currency}</p>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{status.label}</p>
                       </div>
                       <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#8814B1] group-hover:text-white transition-all">
                          <RiArrowRightSLine size={24} />
                       </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Tracking View */}
        {order && (
          <div className="space-y-10 animate-in slide-in-from-bottom-12 duration-700">
            {/* Header Control */}
            <div className="flex items-center justify-between">
               <button onClick={() => setOrder(null)} className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-900 transition-colors">
                  <RiArrowLeftLine size={20} /> {t.backToMain}
               </button>
               <span className="px-6 py-2 bg-purple-50 text-[#8814B1] rounded-full font-black text-sm uppercase tracking-widest">
                  #{order.orderNumber}
               </span>
            </div>

            {/* Visual Tracking Map */}
            <div className="bg-white rounded-[48px] p-12 shadow-sm border border-gray-50">
              <h3 className="text-2xl font-black text-gray-900 mb-12">{t.orderRoute}</h3>

              {order.status === "cancelled" ? (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
                    <MdCancel size={48} />
                  </div>
                  <h4 className="text-2xl font-black text-red-500 mb-2">{t.orderCancelled}</h4>
                  <p className="text-gray-400 font-medium">{t.orderCancelledDesc}</p>
                </div>
              ) : (
                <div className="relative pt-10 pb-4">
                  {/* Global Progress Bar */}
                  <div className="absolute top-[48px] left-0 right-0 h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#8814B1] to-purple-400 transition-all duration-1000 ease-out"
                      style={{
                        width: `${
                          (getStatusSteps(order.status).filter((s) => s.completed).length / 4) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {/* Nodes */}
                  <div className="relative flex justify-between">
                    {getStatusSteps(order.status).map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                              step.active
                                ? `bg-[#8814B1] text-white scale-125 z-10 shadow-xl shadow-purple-200 ring-8 ring-purple-50`
                                : step.completed
                                ? "bg-[#8814B1] text-white"
                                : "bg-white border-2 border-gray-100 text-gray-200"
                            }`}
                          >
                            <Icon size={step.active ? 28 : 24} />
                          </div>
                          <p className={`mt-6 text-[10px] font-black uppercase tracking-tighter ${
                              step.active ? "text-[#8814B1]" : "text-gray-400"
                            }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Order Summary */}
               <div className="bg-white rounded-[40px] p-10 border border-gray-50 shadow-sm">
                  <h4 className="text-xl font-black text-gray-900 mb-8">{t.orderContents}</h4>
                  <div className="space-y-6">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-5 p-4 bg-gray-50/50 rounded-3xl group border border-gray-50">
                        <div className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden shrink-0 border border-gray-100 group-hover:scale-105 transition-transform">
                          <Image src={item.product.image} alt={item.product.name} fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-gray-900 leading-tight mb-1">{item.product.name}</p>
                          <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                             <span className="capitalize">{item.size}</span>
                             <span className="w-1 h-1 bg-gray-200 rounded-full" />
                             <span>{item.quantity} {t.pcs}.</span>
                          </p>
                          {item.print && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="relative w-8 h-8 bg-white rounded-lg overflow-hidden border border-purple-100 shadow-xs shrink-0">
                                  <Image
                                    src={item.print.frontImagePreview || item.print.frontImage}
                                    alt={item.print.name}
                                    fill
                                    sizes="32px"
                                    className="object-contain p-0.5"
                                  />
                              </div>
                              <p className="text-[10px] font-black text-[#8814B1] uppercase tracking-tight">
                                {t.design}: {item.print.name}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                           <p className="font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}</p>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.currency}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex justify-between items-end">
                     <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.total}</p>
                        <p className="text-3xl font-black text-gray-900">{order.totalAmount.toLocaleString()} <span className="text-lg">{t.currency}</span></p>
                     </div>
                  </div>
               </div>

               {/* Logistics & Support */}
               <div className="space-y-8">
                  <div className="bg-gray-900 rounded-[40px] p-10 text-white shadow-2xl">
                     <h4 className="text-xl font-black mb-6">{t.deliveryAddress}</h4>
                     <div className="space-y-1 mb-8">
                        <p className="text-gray-400 font-bold leading-tight">
                           {order.region}, {getTranslatedVillage(order.region, order.village)}
                        </p>
                        <p className="text-gray-400 font-bold leading-relaxed">{order.customerAddress}</p>
                     </div>
                     <div className="bg-white/10 rounded-3xl p-6">
                        <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">{t.contactPerson}</p>
                        <p className="font-bold text-white text-lg">{order.customerName}</p>
                     </div>
                  </div>
                  <div className="bg-[#8814B1] rounded-[40px] p-10 text-white flex flex-col justify-between min-h-[220px] relative overflow-hidden group">
                     <RiTelegram2Line className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                     <h4 className="text-xl font-black relative z-10">{t.needHelp}</h4>
                     <p className="text-purple-100 font-medium text-sm relative z-10 leading-relaxed">{t.needHelpDesc}</p>
                     <a href="https://t.me/artlavkauz" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#8814B1] rounded-2xl font-black text-sm uppercase tracking-widest relative z-10 self-start mt-6 hover:shadow-xl transition-all active:scale-95">
                        {t.writeManager}
                     </a>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
