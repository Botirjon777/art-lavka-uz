"use client";

import { IconType } from "react-icons";

interface MenuSectionProps {
  icon: IconType;
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  iconBgColor?: string;
  iconColor?: string;
  lang: string;
}

export default function MenuSection({
  icon: Icon,
  title,
  value,
  onChange,
  placeholder,
  rows = 4,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600",
  lang,
}: MenuSectionProps) {
  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-4 text-left">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
        <div className={`w-10 h-10 ${iconBgColor} ${iconColor} rounded-xl flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          {title} {lang.toUpperCase()}
        </h3>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] outline-none transition-all text-sm text-gray-600 leading-relaxed"
      />
    </div>
  );
}
