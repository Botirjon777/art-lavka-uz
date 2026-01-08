import React from "react";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function IconButton({
  variant = "secondary",
  size = "md",
  children,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary: "bg-[#00C6F1] hover:bg-[#00C6F1]/80 text-white",
    secondary: "bg-[#8814B1] hover:bg-[#8814B1]/80 text-white",
  };

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
