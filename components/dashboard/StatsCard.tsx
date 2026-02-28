import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "green" | "orange" | "red" | "purple"; // Kept for compatibility, but ignored visually
  subtitle?: string;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  delay = 0,
}: StatsCardProps) {
  return (
    <div
      className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
      style={{
        animation: `slideInUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{title}</h3>
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
      </div>
      <p className="text-3xl font-bold text-zinc-900">{value}</p>
      {subtitle && (
        <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
