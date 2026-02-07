"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { AlertCircle, Check } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, helperText, className = "", ...props }, ref) => {
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border-2 
              font-medium text-gray-900 placeholder:text-gray-400
              transition-all duration-200
              focus:outline-none focus:ring-2
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${
                hasError
                  ? "border-danger-500 focus:border-danger-500 focus:ring-danger-200"
                  : hasSuccess
                    ? "border-success-500 focus:border-success-500 focus:ring-success-200"
                    : "border-gray-200 focus:border-brand-500 focus:ring-brand-200"
              }
              ${hasError || hasSuccess ? "pr-12" : ""}
              ${className}
            `}
            {...props}
          />

          {/* Success/Error Icon */}
          {(hasError || hasSuccess) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {hasError && (
                <AlertCircle className="w-5 h-5 text-danger-500" />
              )}
              {hasSuccess && <Check className="w-5 h-5 text-success-500" />}
            </div>
          )}
        </div>

        {/* Helper/Error Text */}
        {(error || helperText) && (
          <p
            className={`mt-2 text-sm font-medium ${
              hasError ? "text-danger-600" : "text-gray-500"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
