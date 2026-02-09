import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red" | "purple";
  subtitle?: string;
  delay?: number;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    text: "text-blue-600",
    title: "text-blue-800",
    subtitle: "text-blue-700",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    text: "text-green-600",
    title: "text-green-800",
    subtitle: "text-green-700",
    border: "border-green-200",
  },
  orange: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    text: "text-amber-600",
    title: "text-amber-800",
    subtitle: "text-amber-700",
    border: "border-amber-200",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    text: "text-red-600",
    title: "text-red-800",
    subtitle: "text-red-700",
    border: "border-red-200",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    text: "text-purple-600",
    title: "text-purple-800",
    subtitle: "text-purple-700",
    border: "border-purple-200",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  delay = 0,
}: StatsCardProps) {
  const colors = colorMap[color];
  const isAlert = color === "red" && typeof value === "number" && value > 0;

  return (
    <div
      className={`${colors.bg} rounded-xl border-2 ${colors.border} p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden`}
      style={{
        animation: `slideInUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p
            className={`text-sm font-medium ${isAlert ? "text-red-800" : colors.title} transition-colors duration-200`}
          >
            {title}
          </p>
          <p
            className={`text-4xl font-bold ${colors.text} group-hover:scale-110 transition-transform duration-300 origin-left`}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={`text-sm font-medium ${colors.subtitle} transition-colors duration-200`}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`${colors.iconBg} p-3 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-md group-hover:shadow-xl`}
        >
          <Icon className={`w-10 h-10 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}
