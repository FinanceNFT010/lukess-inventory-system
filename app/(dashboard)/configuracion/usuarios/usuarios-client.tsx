"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  RefreshCw,
  UserX,
  UserCheck,
  X,
  Check,
} from "lucide-react";
import type { Profile, AccessRequest } from "@/lib/types";
import {
  updateUserRole,
  toggleUserActive,
  approveAccessRequest,
  rejectAccessRequest,
} from "./actions";

interface UsuariosClientProps {
  profiles: Profile[];
  accessRequests: AccessRequest[];
  currentUserId: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Gerente",
  staff: "Vendedor",
};

const roleBadgeClass: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  manager: "bg-blue-100 text-blue-700 border-blue-200",
  staff: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UsuariosClient({
  profiles,
  accessRequests,
  currentUserId,
}: UsuariosClientProps) {
  const [activeTab, setActiveTab] = useState<"usuarios" | "solicitudes">(
    "usuarios"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<
    Record<string, "admin" | "manager" | "staff">
  >({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const pendingCount = accessRequests.filter(
    (r) => r.status === "pending"
  ).length;
  const activeCount = profiles.filter((p) => p.is_active).length;

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleOpenRoleDropdown(userId: string, currentRole: string) {
    setOpenRoleDropdown(userId);
    setPendingRole((prev) => ({
      ...prev,
      [userId]: currentRole as "admin" | "manager" | "staff",
    }));
  }

  function handleRoleChange(userId: string) {
    const newRole = pendingRole[userId];
    if (!newRole) return;
    setLoadingAction(`role-${userId}`);
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        toast.success("Rol actualizado correctamente.");
        setOpenRoleDropdown(null);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al actualizar el rol."
        );
      } finally {
        setLoadingAction(null);
      }
    });
  }

  function handleToggleActive(userId: string, currentActive: boolean) {
    if (userId === currentUserId) return;
    setLoadingAction(`active-${userId}`);
    startTransition(async () => {
      try {
        await toggleUserActive(userId, !currentActive);
        toast.success(
          currentActive ? "Usuario desactivado." : "Usuario activado."
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al cambiar estado."
        );
      } finally {
        setLoadingAction(null);
      }
    });
  }

  function handleApprove(requestId: string) {
    setLoadingAction(`approve-${requestId}`);
    startTransition(async () => {
      try {
        await approveAccessRequest(requestId);
        toast.success("Solicitud aprobada. Se envió invitación al email.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al aprobar solicitud."
        );
      } finally {
        setLoadingAction(null);
      }
    });
  }

  function handleReject(requestId: string) {
    setLoadingAction(`reject-${requestId}`);
    startTransition(async () => {
      try {
        await rejectAccessRequest(requestId, rejectionReason);
        toast.success("Solicitud rechazada.");
        setRejectingId(null);
        setRejectionReason("");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error al rechazar solicitud."
        );
      } finally {
        setLoadingAction(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-blue-100 mt-1">
              Administra usuarios, roles y solicitudes de acceso
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === "usuarios"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("solicitudes")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === "solicitudes"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Solicitudes de Acceso
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="p-6">
          {/* ══════ TAB 1: USUARIOS ══════ */}
          {activeTab === "usuarios" && (
            <div className="space-y-4">
              {/* Table header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    Gestión de Usuarios
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {activeCount} usuario{activeCount !== 1 ? "s" : ""} activo
                    {activeCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all w-full sm:w-72"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Usuario
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Rol
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-400 text-sm"
                        >
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {/* Avatar + Nombre */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {getInitials(user.full_name)}
                              </div>
                              <span className="font-medium text-gray-900">
                                {user.full_name}
                              </span>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-4 py-3 text-gray-600">
                            {user.email}
                          </td>
                          {/* Rol */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeClass[user.role]}`}
                            >
                              {roleLabels[user.role]}
                            </span>
                          </td>
                          {/* Estado */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                user.is_active
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`}
                              />
                              {user.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          {/* Acciones */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {/* Role change button + dropdown */}
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    openRoleDropdown === user.id
                                      ? setOpenRoleDropdown(null)
                                      : handleOpenRoleDropdown(
                                          user.id,
                                          user.role
                                        )
                                  }
                                  disabled={
                                    loadingAction === `role-${user.id}` ||
                                    isPending
                                  }
                                  title="Cambiar rol"
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <RefreshCw
                                    className={`w-4 h-4 ${loadingAction === `role-${user.id}` ? "animate-spin" : ""}`}
                                  />
                                </button>
                                {openRoleDropdown === user.id && (
                                  <div className="absolute left-0 top-full mt-1 z-20 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 min-w-[160px]">
                                    <p className="text-xs font-semibold text-gray-500 px-2 pb-2 uppercase tracking-wide">
                                      Seleccionar rol
                                    </p>
                                    {(
                                      ["admin", "manager", "staff"] as const
                                    ).map((r) => (
                                      <button
                                        key={r}
                                        onClick={() =>
                                          setPendingRole((prev) => ({
                                            ...prev,
                                            [user.id]: r,
                                          }))
                                        }
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                          pendingRole[user.id] === r
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                      >
                                        {roleLabels[r]}
                                      </button>
                                    ))}
                                    <div className="border-t border-gray-100 mt-2 pt-2 flex gap-1">
                                      <button
                                        onClick={() => handleRoleChange(user.id)}
                                        disabled={
                                          pendingRole[user.id] === user.role
                                        }
                                        className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() =>
                                          setOpenRoleDropdown(null)
                                        }
                                        className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Toggle active/inactive */}
                              {user.id === currentUserId ? (
                                <div
                                  title="No puedes desactivarte a ti mismo"
                                  className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
                                >
                                  <UserX className="w-4 h-4" />
                                </div>
                              ) : user.is_active ? (
                                <button
                                  onClick={() =>
                                    handleToggleActive(user.id, true)
                                  }
                                  disabled={
                                    loadingAction === `active-${user.id}` ||
                                    isPending
                                  }
                                  title="Desactivar"
                                  className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleToggleActive(user.id, false)
                                  }
                                  disabled={
                                    loadingAction === `active-${user.id}` ||
                                    isPending
                                  }
                                  title="Activar"
                                  className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════ TAB 2: SOLICITUDES ══════ */}
          {activeTab === "solicitudes" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                Solicitudes de Acceso
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">
                    {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
                  </span>
                )}
              </h2>

              <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Nombre
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Teléfono
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Mensaje
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Fecha
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Estado
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {accessRequests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-gray-400 text-sm"
                        >
                          No hay solicitudes de acceso.
                        </td>
                      </tr>
                    ) : (
                      accessRequests.map((req) => (
                        <tr
                          key={req.id}
                          className="hover:bg-gray-50 transition-colors align-top"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {req.full_name}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {req.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {req.phone || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                            {req.message ? (
                              <span
                                title={req.message}
                                className="cursor-help"
                              >
                                {req.message.length > 60
                                  ? `${req.message.slice(0, 60)}…`
                                  : req.message}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {formatDate(req.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass[req.status]}`}
                            >
                              {statusLabel[req.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {req.status === "pending" ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                  {/* Approve */}
                                  <button
                                    onClick={() => handleApprove(req.id)}
                                    disabled={
                                      loadingAction === `approve-${req.id}` ||
                                      isPending
                                    }
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Aprobar
                                  </button>
                                  {/* Reject */}
                                  {rejectingId === req.id ? (
                                    <button
                                      onClick={() => handleReject(req.id)}
                                      disabled={
                                        loadingAction ===
                                          `reject-${req.id}` || isPending
                                      }
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Confirmar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setRejectingId(req.id);
                                        setRejectionReason("");
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      Rechazar
                                    </button>
                                  )}
                                </div>
                                {rejectingId === req.id && (
                                  <div className="space-y-1">
                                    <textarea
                                      value={rejectionReason}
                                      onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                      }
                                      placeholder="Motivo de rechazo (opcional)..."
                                      rows={2}
                                      className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg text-xs resize-none focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none transition-all"
                                    />
                                    <button
                                      onClick={() => {
                                        setRejectingId(null);
                                        setRejectionReason("");
                                      }}
                                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                Sin acciones
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
