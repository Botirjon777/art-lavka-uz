import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export default function Textarea({
  label,
  error,
  helperText,
  showCharCount = false,
  maxLength,
  className = "",
  id,
  value,
  ...props
}: TextareaProps) {
  const textareaId =
    id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        maxLength={maxLength}
        value={value}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-[#00C6F1]"
        } ${
          props.disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        } ${className}`}
        {...props}
      />

      <div className="flex justify-between items-center mt-1">
        <div className="flex-1">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>

        {showCharCount && maxLength && (
          <p className="text-sm text-gray-500 ml-2">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
