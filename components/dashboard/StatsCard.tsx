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
    bg: "bg-brand-50",
    icon: "bg-brand-600",
    text: "text-brand-600",
  },
  green: {
    bg: "bg-success-50",
    icon: "bg-success-600",
    text: "text-success-600",
  },
  orange: {
    bg: "bg-warning-50",
    icon: "bg-warning-600",
    text: "text-warning-600",
  },
  red: {
    bg: "bg-danger-50",
    icon: "bg-danger-600",
    text: "text-danger-600",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-600",
    text: "text-purple-600",
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
      className={`bg-white rounded-xl border-2 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 animate-fade-in ${
        isAlert ? "border-danger-300 animate-pulse" : "border-gray-200"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isAlert ? "text-danger-800" : "text-gray-500"}`}>
            {title}
          </p>
          <p className={`text-4xl font-bold ${isAlert ? "text-danger-600" : "text-gray-900"}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs font-semibold ${isAlert ? "text-danger-800" : colors.text}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 group`}
        >
          <Icon className={`w-8 h-8 ${colors.text} transition-transform group-hover:rotate-12`} />
        </div>
      </div>
    </div>
  );
}
