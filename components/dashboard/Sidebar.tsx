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
  ShoppingBag,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Store,
  X,
  Users,
  Megaphone,
} from "lucide-react";
import { PendingOrdersBadge } from "./PendingOrdersBadge";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  subLinks?: { label: string; href: string }[];
}

const navLinks: NavLink[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
    roles: ["admin", "manager"],
  },
  {
    label: "Inventario",
    href: "/inventario",
    icon: Package,
    roles: ["admin", "manager", "staff"],
    subLinks: [
      {
        label: "Ver Historial",
        href: "/inventario/historial",
      },
    ],
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
    roles: ["admin", "manager", "staff"],
    subLinks: [
      {
        label: "Ver Historial",
        href: "/ventas/historial",
      },
    ],
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: ShoppingBag,
    roles: ["admin", "manager"],
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
  {
    label: "Usuarios",
    href: "/configuracion/usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
    roles: ["admin", "manager"],
  },
];

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  staff: "Vendedor",
};

interface SidebarProps {
  profile: Profile;
  lowStockCount?: number;
  pendingOrdersCount?: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ profile, lowStockCount = 0, pendingOrdersCount = 0 }: SidebarProps): React.JSX.Element {
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

  const handleLogout = async (): Promise<void> => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const initials = getInitials(profile.full_name);

  // Filter links by role
  const visibleLinks = navLinks.filter((link) =>
    link.roles.includes(profile.role)
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
      >
        {mobileOpen ? (
          <X className="w-6 h-6 text-zinc-700" />
        ) : (
          <Menu className="w-6 h-6 text-zinc-700" />
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
          fixed lg:sticky top-0 h-screen bg-zinc-50 border-r border-zinc-200 
          flex flex-col z-40 transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-zinc-200">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-600 rounded-full border-2 border-zinc-50"></div>
              </div>
              <div>
                <span className="font-display font-bold text-xl text-zinc-900 block leading-tight">
                  LUKESS
                </span>
                <span className="text-xs font-semibold text-zinc-500 tracking-wide">
                  HOME INVENTORY
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-11 h-11 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <Store className="w-6 h-6 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-600 rounded-full border-2 border-zinc-50"></div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            const showLowStockBadge = link.href === "/inventario" && lowStockCount > 0;

            return (
              <div key={link.href} className="relative">
                <Link
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) setMobileOpen(false);
                  }}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-zinc-200 text-zinc-900 font-semibold border-r-2 border-gold-500"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }
                  `}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? "text-zinc-900" : "text-zinc-400"
                      }`}
                  />
                  {!collapsed && (
                    <span className="flex-1">{link.label}</span>
                  )}
                  {!collapsed && showLowStockBadge && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {lowStockCount}
                    </span>
                  )}
                </Link>
                {/* Realtime pending orders badge (expanded & collapsed) */}
                {link.href === "/pedidos" && (
                  <PendingOrdersBadge initialCount={pendingOrdersCount} />
                )}

                {/* Sub-links */}
                {!collapsed && link.subLinks && active && (
                  <div className="ml-8 mt-1 space-y-1">
                    {link.subLinks.map((subLink) => (
                      <Link
                        key={subLink.href}
                        href={subLink.href}
                        className={`
                          block px-3 py-2 rounded-lg text-xs font-medium transition-colors
                          ${pathname === subLink.href
                            ? "bg-zinc-200 text-zinc-900"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                          }
                        `}
                      >
                        {subLink.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-zinc-200 space-y-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-100 border border-zinc-200">
              <div className="w-11 h-11 bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs font-semibold text-gold-600 truncate">
                  {roleLabels[profile.role] || profile.role}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-11 h-11 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-white font-bold text-sm shadow-lg">
              {initials}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full group border border-transparent hover:border-red-200 mt-3"
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
