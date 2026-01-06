import React from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: DropdownOption[];
  placeholder?: string;
}

export default function Dropdown({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: DropdownProps) {
  const dropdownId =
    id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={dropdownId}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors appearance-none bg-white ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-[#00C6F1]"
        } ${
          props.disabled ? "bg-gray-100 cursor-not-allowed" : ""
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
