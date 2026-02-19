"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Package,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  Send,
} from "lucide-react";

type Tab = "login" | "request";

export default function LoginPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Access request form state
  const [reqFullName, setReqFullName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

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

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reqFullName.trim().length < 3) {
      toast.error("El nombre completo debe tener al menos 3 caracteres.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reqEmail)) {
      toast.error("Ingresa un correo electrónico válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .limit(1)
        .single();

      if (orgError || !orgData) {
        throw new Error("No se pudo obtener la organización.");
      }

      const { error: insertError } = await supabase
        .from("access_requests")
        .insert({
          full_name: reqFullName.trim(),
          email: reqEmail.trim(),
          phone: reqPhone.trim() || null,
          message: reqMessage.trim() || null,
          status: "pending",
          organization_id: orgData.id,
        });

      if (insertError) throw insertError;

      setRequestSuccess(true);
    } catch (err) {
      console.error("Error al enviar solicitud de acceso:", err);
      toast.error("Error al enviar solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToTab = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "login") {
      setRequestSuccess(false);
      setReqFullName("");
      setReqEmail("");
      setReqPhone("");
      setReqMessage("");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
      {/* Logo / Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Lukess Home</h1>
        <p className="text-gray-500 text-sm">Sistema de Inventario y Ventas</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => switchToTab("login")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "login"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => switchToTab("request")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "request"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Solicitar Acceso
        </button>
      </div>

      {/* TAB 1 — Login */}
      {activeTab === "login" && (
        <>
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

          {/* Link to request access */}
          <p className="text-center text-sm text-gray-500">
            ¿Eres nuevo empleado?{" "}
            <button
              type="button"
              onClick={() => switchToTab("request")}
              className="text-blue-600 hover:text-blue-700 font-medium transition"
            >
              Solicita acceso →
            </button>
          </p>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">
                Acceso rápido
              </span>
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
        </>
      )}

      {/* TAB 2 — Access Request */}
      {activeTab === "request" && (
        <>
          {requestSuccess ? (
            /* Success state */
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 space-y-4 text-center">
              <div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-green-800">
                  ¡Solicitud enviada!
                </h2>
                <p className="text-sm text-green-700 leading-relaxed">
                  Tu solicitud fue recibida. Un administrador revisará tu
                  información y se pondrá en contacto contigo pronto para darte
                  acceso al sistema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchToTab("login")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            /* Request form */
            <form onSubmit={handleAccessRequest} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-fullname"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="req-fullname"
                    type="text"
                    value={reqFullName}
                    onChange={(e) => setReqFullName(e.target.value)}
                    placeholder="Ej: Juan Pérez García"
                    minLength={3}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-email"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="req-email"
                    type="email"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-phone"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Teléfono{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="req-phone"
                    type="tel"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    placeholder="Ej: 70123456"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="req-message"
                  className="text-sm font-medium text-gray-700 block"
                >
                  Mensaje{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <textarea
                    id="req-message"
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    placeholder="¿Por qué necesitas acceso? Ej: Soy empleado del Puesto 2, me indicó Juan que solicitara acceso"
                    rows={3}
                    maxLength={300}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </div>
                <p className="text-xs text-gray-400 text-right">
                  {reqMessage.length}/300
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
