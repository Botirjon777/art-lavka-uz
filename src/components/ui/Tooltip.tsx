"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-white -mt-px",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white -mb-px",
    left: "left-full top-1/2 -translate-y-1/2 border-l-white -ml-px",
    right: "right-full top-1/2 -translate-y-1/2 border-r-white -mr-px",
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-99999 ${positionClasses[position]}`}>
          <div className="bg-white text-[#333333] text-sm py-3 px-4 rounded-xl shadow-2xl border border-gray-100 min-w-[200px] max-w-[300px] relative animate-in fade-in zoom-in duration-200">
            {content}
            <div
              className={`absolute w-0 h-0 border-[6px] border-transparent ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
