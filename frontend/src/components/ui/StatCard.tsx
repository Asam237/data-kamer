import React from "react";
import { motion } from "framer-motion";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent?:
    | "blue"
    | "emerald"
    | "purple"
    | "orange"
    | "rose"
    | "amber";
  description?: string;
  delay?: number;
}

const ACCENTS: Record<
  NonNullable<StatCardProps["accent"]>,
  { text: string; iconBg: string; glow: string }
> = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
    glow: "from-blue-400 to-blue-600",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
    glow: "from-emerald-400 to-emerald-600",
  },
  purple: {
    text: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10",
    glow: "from-purple-400 to-purple-600",
  },
  orange: {
    text: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500/10",
    glow: "from-orange-400 to-orange-600",
  },
  rose: {
    text: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10",
    glow: "from-rose-400 to-rose-600",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    glow: "from-amber-400 to-amber-600",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  accent = "blue",
  description,
  delay = 0,
}) => {
  const colors = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay }}
      className="group relative"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${colors.glow} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300`}
      />
      <div className="relative bg-card rounded-2xl shadow-sm p-6 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              {title}
            </p>
            <p
              className={`text-2xl md:text-3xl font-bold ${colors.text} tracking-tight mt-1 truncate`}
            >
              {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div
            className={`p-3.5 rounded-2xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
