import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { SOURCES, type DataSource, type SourceKey } from "@/lib/sources";

export interface SourceBadgeProps {
  source: SourceKey | DataSource;
  align?: "left" | "right";
  iconOnly?: boolean;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  align = "right",
  iconOnly = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const data: DataSource = typeof source === "string" ? SOURCES[source] : source;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={`Source des données : ${data.label}`}
        aria-expanded={open}
        className="group inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
      >
        <Info className="h-3 w-3 flex-shrink-0" />
        {!iconOnly && <span className="hidden sm:inline">Source</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full z-50 mt-2 w-60 sm:w-72 rounded-xl border border-border bg-card p-3 text-xs shadow-lg ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <p className="mb-1 font-semibold text-foreground">{data.label}</p>
            <p className="leading-relaxed text-muted-foreground">
              {data.citation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SourceBadge;
