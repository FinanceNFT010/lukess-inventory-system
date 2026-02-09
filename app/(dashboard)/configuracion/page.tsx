import { Settings, Users, Bell, Palette, Building2, Shield } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Personaliza tu sistema de inventario
          </p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
        <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-md">
          <Settings className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Próximamente disponible
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Estamos trabajando en las configuraciones del sistema. 
          Pronto podrás personalizar todos los aspectos de tu inventario.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Organización */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 p-3 rounded-xl inline-block mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Organización
          </h3>
          <p className="text-sm text-gray-500">
            Configura el nombre, logo y datos de tu empresa o negocio.
          </p>
          <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            Próximamente
          </span>
        </div>

        {/* Usuarios */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-green-100 p-3 rounded-xl inline-block mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Usuarios y Permisos
          </h3>
          <p className="text-sm text-gray-500">
            Gestiona empleados, roles y permisos de acceso al sistema.
          </p>
          <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            Próximamente
          </span>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-red-100 p-3 rounded-xl inline-block mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Seguridad
          </h3>
          <p className="text-sm text-gray-500">
            Configura autenticación, contraseñas y políticas de seguridad.
          </p>
          <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            Próximamente
          </span>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-amber-100 p-3 rounded-xl inline-block mb-4">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notificaciones
          </h3>
          <p className="text-sm text-gray-500">
            Configura alertas de stock bajo, ventas y reportes automáticos.
          </p>
          <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            Próximamente
          </span>
        </div>

        {/* Personalización */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="bg-purple-100 p-3 rounded-xl inline-block mb-4">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Personalización
          </h3>
          <p className="text-sm text-gray-500">
            Temas, colores y preferencias visuales del sistema.
          </p>
          <span className="inline-block mt-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            Próximamente
          </span>
        </div>

        {/* Más opciones */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-6 flex items-center justify-center">
          <div className="text-center">
            <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">
              Más opciones próximamente...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
