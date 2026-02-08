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
      className={`${colors.bg} rounded-xl border-2 ${colors.border} p-6 hover:shadow-lg hover:scale-[1.03] transition-all duration-200 animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isAlert ? "text-red-800" : colors.title}`}>
            {title}
          </p>
          <p className={`text-4xl font-bold ${colors.text}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm font-medium ${colors.subtitle}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`${colors.iconBg} p-3 rounded-full flex items-center justify-center flex-shrink-0 group`}
        >
          <Icon
            className={`w-10 h-10 transition-transform group-hover:rotate-12 ${colors.text}`}
          />
        </div>
      </div>
    </div>
  );
}
