import React from "react";
import { Search, Sun, Moon, Star, Menu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  title: string;
  onOpenFavorites?: () => void;
  onOpenMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenCommandPalette,
  title,
  onOpenFavorites,
  onOpenMenu,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isMac =
    typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-8 py-3 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2 min-w-0">
        {/* Bouton menu (mobile / tablette) */}
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <p className="text-sm font-medium text-muted-foreground truncate">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Recherche : bouton complet dès sm, icône seule sur mobile */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 sm:w-56 md:w-72 px-3 py-2 rounded-xl border border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors text-sm"
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Rechercher...</span>
          <kbd className="ml-auto hidden md:inline-block text-[10px] font-semibold border border-border rounded px-1.5 py-0.5 bg-card">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>
        <button
          onClick={onOpenCommandPalette}
          title="Rechercher"
          className="sm:hidden w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Rechercher"
        >
          <Search className="w-4 h-4" />
        </button>

        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            title="Favoris"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-amber-500 hover:border-amber-500/40 transition-colors"
          >
            <Star className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={toggleTheme}
          title="Changer le thème"
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
