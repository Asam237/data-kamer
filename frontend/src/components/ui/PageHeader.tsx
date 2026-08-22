import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  align?: "center" | "left";
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  align = "left",
}) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
      align === "center" ? "text-center md:text-left" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="hidden sm:flex w-11 h-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {actions}
      </div>
    )}
  </motion.div>
);

export default PageHeader;
