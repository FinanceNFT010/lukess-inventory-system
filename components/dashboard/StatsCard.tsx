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

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className={`text-xs font-semibold ${colors.text}`}>{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-7 h-7 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}
