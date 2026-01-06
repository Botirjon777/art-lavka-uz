import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  prefixIcon,
  suffixIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {prefixIcon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            prefixIcon ? "pl-10" : ""
          } ${suffixIcon ? "pr-10" : ""} ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[#00C6F1]"
          } ${
            props.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          } ${className}`}
          {...props}
        />

        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {suffixIcon}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
