import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gradient" | "white" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 cursor-pointer";

  const variants = {
    primary:
      "bg-[#00C6F1] hover:bg-[#00C6F1]/80 text-white shadow-md rounded-lg",
    secondary:
      "bg-[#8814B1] hover:bg-[#8814B1]/80 text-white shadow-md rounded-xl",
    gradient:
      "bg-gradient-to-r from-[#8814B1] to-[#a01dc4] hover:from-[#8814B1]/90 hover:to-[#a01dc4]/90 text-white shadow-md hover:shadow-lg rounded-lg",
    white: "bg-white hover:bg-white/90 text-[#333333] shadow-sm rounded-xl",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white rounded-lg",
  };

  const sizes = {
    sm: "py-2 px-4 text-sm",
    md: "py-3 px-6 text-base",
    lg: "py-3.5 px-[35px] text-base",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <span>{icon}</span>}
          {children}
          {icon && iconPosition === "right" && <span>{icon}</span>}
        </>
      )}
    </button>
  );
}
