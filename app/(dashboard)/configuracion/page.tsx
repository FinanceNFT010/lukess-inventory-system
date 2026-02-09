import {
  Settings,
  Users,
  Bell,
  Palette,
  Building2,
  Shield,
  Zap,
  Globe,
  Database,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Organización",
    description:
      "Configura el nombre, logo, datos fiscales y dirección de tu empresa o negocio.",
    color: "blue",
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-700",
    status: "Próximamente",
  },
  {
    icon: Users,
    title: "Usuarios y Permisos",
    description:
      "Gestiona empleados, roles (admin, gerente, vendedor) y permisos de acceso al sistema.",
    color: "green",
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
    gradient: "from-green-500 to-green-700",
    status: "Próximamente",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description:
      "Configura autenticación, contraseñas fuertes y políticas de acceso seguro.",
    color: "red",
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
    gradient: "from-red-500 to-red-700",
    status: "Próximamente",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description:
      "Alertas automáticas de stock bajo, ventas del día y reportes semanales por email.",
    color: "amber",
    bg: "bg-amber-100",
    text: "text-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-500 to-amber-700",
    status: "Próximamente",
  },
  {
    icon: Palette,
    title: "Personalización",
    description:
      "Temas claros y oscuros, colores de marca y preferencias visuales del sistema.",
    color: "purple",
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    gradient: "from-purple-500 to-purple-700",
    status: "Próximamente",
  },
  {
    icon: Zap,
    title: "Integraciones",
    description:
      "Conecta con WhatsApp, facturación electrónica, contabilidad y más servicios.",
    color: "cyan",
    bg: "bg-cyan-100",
    text: "text-cyan-600",
    border: "border-cyan-200",
    gradient: "from-cyan-500 to-cyan-700",
    status: "Próximamente",
  },
  {
    icon: Globe,
    title: "Ubicaciones",
    description:
      "Agrega, edita o desactiva sucursales y puestos de venta de tu negocio.",
    color: "pink",
    bg: "bg-pink-100",
    text: "text-pink-600",
    border: "border-pink-200",
    gradient: "from-pink-500 to-pink-700",
    status: "Próximamente",
  },
  {
    icon: Database,
    title: "Respaldos",
    description:
      "Backups automáticos de tus datos, exportación masiva y restauración del sistema.",
    color: "gray",
    bg: "bg-gray-200",
    text: "text-gray-600",
    border: "border-gray-300",
    gradient: "from-gray-500 to-gray-700",
    status: "Próximamente",
  },
];

export default function ConfiguracionPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
        style={{ animation: "slideInUp 0.5s ease-out both" }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configuración</h1>
            <p className="text-blue-100 mt-1">
              Personaliza tu sistema de inventario
            </p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 flex items-center gap-4"
        style={{ animation: "slideInUp 0.5s ease-out 100ms both" }}
      >
        <div className="bg-amber-100 p-3 rounded-xl">
          <Zap className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-amber-900">
            En desarrollo activo
          </h2>
          <p className="text-sm text-amber-700 mt-1">
            Estas funcionalidades están siendo implementadas para la versión
            completa del sistema. El equipo de desarrollo está trabajando para
            tenerlas listas lo más pronto posible.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            style={{
              animation: `slideInUp 0.5s ease-out ${(i + 2) * 80}ms both`,
            }}
          >
            {/* Hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div
                className={`${feature.bg} p-3 rounded-xl inline-flex mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md group-hover:shadow-lg`}
              >
                <feature.icon className={`w-6 h-6 ${feature.text}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {feature.description}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold rounded-full shadow-md`}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                {feature.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div
        className="bg-gray-50 rounded-2xl border-2 border-gray-200 p-6 text-center"
        style={{
          animation: `slideInUp 0.5s ease-out ${(features.length + 2) * 80}ms both`,
        }}
      >
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-800">Versión actual: </span>
          Demo 1.0 — Sistema básico de inventario y ventas.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Todas las configuraciones adicionales estarán disponibles en la
          versión completa del sistema.
        </p>
      </div>
    </div>
  );
}
