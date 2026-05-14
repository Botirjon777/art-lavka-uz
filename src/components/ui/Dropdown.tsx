"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

export interface DropdownProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  id?: string;
  name?: string;
}

export default function Dropdown({
  label,
  error,
  helperText,
  options,
  placeholder = "Select an option",
  value = "",
  onChange,
  required = false,
  disabled = false,
  className = "",
  buttonClassName = "",
  id,
  name,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownId = React.useMemo(
    () => id || `dropdown-${Math.random().toString(36).substr(2, 9)}`,
    [id],
  );

  // Find the selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Update position coordinates
  const updateCoords = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const menuHeight = 240; // max-h-60 is 240px
      
      let top = rect.bottom + window.scrollY;
      let left = rect.left + window.scrollX;
      const windowWidth = window.innerWidth;
      
      // If menu would go off bottom of screen, show above
      if (rect.bottom + menuHeight > windowHeight && rect.top > menuHeight) {
        top = rect.top + window.scrollY - menuHeight - 8;
      }

      // If menu would go off right side of screen, align to right
      if (rect.left + rect.width > windowWidth) {
        left = windowWidth - rect.width - 16 + window.scrollX;
      }

      setCoords({
        top,
        left: Math.max(8, left),
        width: rect.width,
      });
    }
  };

  // Close dropdown when clicking outside and handle portal positioning
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Check if click was inside the portal menu
        const portalMenu = document.getElementById(`${dropdownId}-menu`);
        if (portalMenu && portalMenu.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen, dropdownId]);

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onChange?.(optionValue);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown" && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex =
        currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      onChange?.(options[nextIndex].value);
    } else if (e.key === "ArrowUp" && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      onChange?.(options[prevIndex].value);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        {name && <input type="hidden" name={name} value={value} />}
        {/* Dropdown Button */}
        <button
          type="button"
          id={dropdownId}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full ${
            buttonClassName || "px-4 py-3"
          } border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-left flex items-center justify-between ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[#8814B1]"
          } ${
            disabled
              ? "bg-gray-100 cursor-not-allowed text-gray-400"
              : "bg-white hover:border-[#8814B1] cursor-pointer"
          } ${isOpen ? "ring-2 ring-[#8814B1] border-[#8814B1]" : ""}`}
        >
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Arrow Icon */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu Portaled to Body */}
        {isOpen &&
          !disabled &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              id={`${dropdownId}-menu`}
              className="absolute z-9999 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
              style={{
                top: coords.top + 8,
                left: coords.left,
                width: coords.width,
              }}
            >
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options available
                </div>
              ) : (
                options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-3 text-left transition-colors duration-150 ${
                      option.value === value
                        ? "bg-[#8814B1]/10 text-[#8814B1] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    } ${index === 0 ? "rounded-t-lg" : ""} ${
                      index === options.length - 1 ? "rounded-b-lg" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-base">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>

                      {/* Checkmark for selected option */}
                      {option.value === value && (
                        <svg
                          className="w-5 h-5 text-[#8814B1] ml-2 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>,
            document.body,
          )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
