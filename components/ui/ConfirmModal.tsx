"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  showNoteInput?: boolean;
  noteValue?: string;
  onNoteChange?: (value: string) => void;
  notePlaceholder?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
  showNoteInput = false,
  noteValue = "",
  onNoteChange,
  notePlaceholder = "Escribe una nota (opcional)...",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${styles.iconBg} ${styles.iconText} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Input (opcional) */}
        {showNoteInput && (
          <div className="px-6 pb-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Nota (opcional):
            </label>
            <textarea
              value={noteValue}
              onChange={(e) => onNoteChange?.(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition resize-none text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ej: Se acabó stock, Producto no vendido, Descontinuado...
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 p-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 font-bold rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 ${styles.button} disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                {variant === "danger" && <Trash2 className="w-4 h-4" />}
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
