import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  MapPin,
  GraduationCap,
  BarChart3,
  Map,
  Zap,
  Settings,
  Scale,
  CornerDownLeft,
  Database,
  Landmark,
} from "lucide-react";
import { searchDataset, type SearchHitKind } from "@/lib/dataset";
import { normalizeText } from "@/lib/search";

export type ViewType =
  | "dashboard"
  | "regions"
  | "universities"
  | "stats"
  | "settings"
  | "outages"
  | "map"
  | "compare"
  | "data";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: ViewType, search?: string) => void;
}

interface ResultItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

const NAV_ITEMS: {
  key: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "dashboard", label: "Tableau de bord", icon: Home },
  { key: "regions", label: "Régions", icon: MapPin },
  { key: "universities", label: "Universités", icon: GraduationCap },
  { key: "compare", label: "Comparateur de régions", icon: Scale },
  { key: "map", label: "Carte", icon: Map },
  { key: "outages", label: "Coupures ENEO", icon: Zap },
  { key: "stats", label: "Statistiques", icon: BarChart3 },
  { key: "data", label: "Données & sources", icon: Database },
  { key: "settings", label: "Paramètres", icon: Settings },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onNavigate,
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const results = useMemo<ResultItem[]>(() => {
    const q = normalizeText(query);

    const navResults: ResultItem[] = NAV_ITEMS.filter((item) =>
      q ? normalizeText(item.label).includes(q) : true
    ).map((item) => ({
      id: `nav-${item.key}`,
      label: item.label,
      description: "Navigation",
      icon: item.icon,
      onSelect: () => onNavigate(item.key),
    }));

    if (!q) return navResults;

    const describe: Record<SearchHitKind, (region: string) => string> = {
      region: () => "Région",
      department: (region) => `Département · Région ${region}`,
      university: (region) => `Université · ${region}`,
    };
    const icons: Record<SearchHitKind, ResultItem["icon"]> = {
      region: MapPin,
      department: Landmark,
      university: GraduationCap,
    };

    const dataResults: ResultItem[] = searchDataset(query).map((hit) => ({
      id: hit.id,
      label: hit.label,
      description: describe[hit.kind](hit.region),
      icon: icons[hit.kind],
      onSelect: () =>
        hit.kind === "university"
          ? onNavigate("universities", hit.label)
          : onNavigate("regions", hit.region),
    }));

    return [...navResults, ...dataResults];
  }, [query, onNavigate]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="fixed left-1/2 top-16 sm:top-24 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
              >
                <Dialog.Title className="sr-only">
                  Recherche DataKamer
                </Dialog.Title>
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher une région, un département, une université..."
                      className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                    />
                    <kbd className="hidden sm:inline-block text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5">
                      ESC
                    </kbd>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-2">
                    {results.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        Aucun résultat pour &quot;{query}&quot;
                      </p>
                    ) : (
                      results.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.onSelect();
                            onOpenChange(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/10">
                            <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </p>
                          </div>
                          <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default CommandPalette;
