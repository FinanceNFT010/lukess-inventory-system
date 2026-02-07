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
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

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
    bg: "bg-brand-50",
    text: "text-brand-600",
    border: "border-brand-600",
  },
  green: {
    bg: "bg-success-50",
    text: "text-success-600",
    border: "border-success-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-600",
  },
  orange: {
    bg: "bg-warning-50",
    text: "text-warning-600",
    border: "border-warning-600",
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

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
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {mobileOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen bg-white border-r border-gray-200 
          flex flex-col z-40 transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="font-display font-bold text-xl bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent block leading-tight">
                  LUKESS
                </span>
                <span className="text-xs font-semibold text-gray-500 tracking-wide">
                  HOME INVENTORY
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-11 h-11 bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Store className="w-6 h-6 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-white"></div>
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
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-brand-50 border border-gray-200">
              {/* Avatar con iniciales */}
              <div className="w-11 h-11 bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs font-semibold text-brand-600 truncate">
                  {roleLabels[profile.role] || profile.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-sm shadow-lg">
              {initials}
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-danger-600 hover:bg-danger-50 hover:text-danger-700 transition-all duration-200 w-full group border-2 border-transparent hover:border-danger-200"
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
