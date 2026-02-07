"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, Eye, EyeOff, Package } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Bienvenido de vuelta!");
    router.push("/");
    router.refresh();
  };

  const fillDemoCredentials = () => {
    setEmail("admin@lukesshome.com");
    setPassword("Admin123!");
    toast("Credenciales demo cargadas", { icon: "📋" });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      {/* Logo / Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Lukess Home</h1>
        <p className="text-gray-500 text-sm">
          Sistema de Inventario y Ventas
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 block"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 block"
          >
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-400">Acceso rápido</span>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Credenciales de prueba
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            <span className="font-medium text-gray-700">Email:</span>{" "}
            admin@lukesshome.com
          </p>
          <p className="text-gray-600">
            <span className="font-medium text-gray-700">Password:</span>{" "}
            Admin123!
          </p>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded-md hover:bg-blue-50 transition"
        >
          Usar credenciales demo
        </button>
      </div>
    </div>
  );
}
