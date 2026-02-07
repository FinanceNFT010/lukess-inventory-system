"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-fade-in">
        {/* Icon */}
        <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-danger-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          ¡Algo salió mal!
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          Lo sentimos, ocurrió un error inesperado.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Nuestro equipo ha sido notificado y estamos trabajando para
          solucionarlo.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-700 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
