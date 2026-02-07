"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, Check } from "lucide-react";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  success?: boolean;
  loadingText?: string;
  successText?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
}

export function LoadingButton({
  loading = false,
  success = false,
  loadingText,
  successText,
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  const variantStyles = {
    primary:
      "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/50 hover:shadow-xl hover:shadow-brand-600/50",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    danger:
      "bg-danger-600 hover:bg-danger-700 text-white shadow-lg shadow-danger-500/50 hover:shadow-xl hover:shadow-danger-600/50",
    success:
      "bg-success-600 hover:bg-success-700 text-white shadow-lg shadow-success-500/50 hover:shadow-xl hover:shadow-success-600/50",
  };

  const isDisabled = disabled || loading || success;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-3 
        font-bold rounded-xl transition-all 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingText || "Procesando..."}</span>
        </>
      )}
      {success && !loading && (
        <>
          <Check className="w-5 h-5" />
          <span>{successText || "¡Completado!"}</span>
        </>
      )}
      {!loading && !success && children}
    </button>
  );
}
