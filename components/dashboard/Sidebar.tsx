"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { Profile } from "@/lib/types";
import {
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Store,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
    color: "blue",
  },
  {
    label: "Inventario",
    href: "/inventario",
    icon: Package,
    color: "green",
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
    color: "purple",
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    color: "orange",
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
    color: "gray",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-600",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-600",
  },
  gray: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-600",
  },
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  staff: "Vendedor",
};

interface SidebarProps {
  profile: Profile;
  lowStockCount?: number;
}

// Helper para obtener iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ profile, lowStockCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const initials = getInitials(profile.full_name);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          flex flex-col bg-white border-r border-gray-200 
          transition-transform duration-300 ease-in-out
          w-64 
          ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 block leading-tight">
                  Lukess Home
                </span>
                <span className="text-xs text-gray-500">Sistema de Inventario</span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md mx-auto">
              <Store className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            const colors = colorMap[link.color];
            const showBadge = link.href === "/inventario" && lowStockCount > 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  // Close sidebar on mobile after clicking
                  if (window.innerWidth < 1024) setCollapsed(true);
                }}
                className={`
                  group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? `${colors.bg} ${colors.text} font-semibold border-l-4 ${colors.border} shadow-sm`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                  }
                `}
                title={collapsed ? link.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    active ? colors.text : "text-gray-400"
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1">{link.label}</span>
                )}
                {!collapsed && showBadge && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
              {/* Avatar con iniciales */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {roleLabels[profile.role] || profile.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full group"
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
