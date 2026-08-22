import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, GraduationCap, X } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import EmptyState from "@/components/ui/EmptyState";
import type { ViewType } from "@/components/CommandPalette";

interface FavoritesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: ViewType, search?: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  open,
  onOpenChange,
  onNavigate,
}) => {
  const { favorites, toggleFavorite } = useFavorites();

  const favoriteRegions = favorites.filter((f) => f.kind === "region");
  const favoriteUniversities = favorites.filter(
    (f) => f.kind === "university"
  );

  const isEmpty =
    favoriteRegions.length === 0 && favoriteUniversities.length === 0;

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
                className="fixed left-1/2 top-16 sm:top-24 -translate-x-1/2 w-full max-w-lg z-[101] px-4"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <Dialog.Title className="flex items-center gap-2 font-bold text-foreground">
                      <Star className="w-5 h-5 text-amber-500" />
                      Mes favoris
                    </Dialog.Title>
                    <Dialog.Close className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                    {isEmpty ? (
                      <EmptyState
                        icon={Star}
                        title="Aucun favori pour l'instant"
                        description="Épinglez des régions ou des universités depuis leurs pages pour les retrouver ici rapidement."
                      />
                    ) : (
                      <>
                        {favoriteRegions.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                              Régions
                            </p>
                            <div className="space-y-1.5">
                              {favoriteRegions.map((entry) => (
                                <div
                                  key={entry.key}
                                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                                >
                                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  <button
                                    className="flex-1 text-left text-sm font-medium text-foreground truncate"
                                    onClick={() => {
                                      onNavigate("regions", entry.label);
                                      onOpenChange(false);
                                    }}
                                  >
                                    {entry.label}
                                  </button>
                                  <button
                                    onClick={() =>
                                      toggleFavorite(
                                        "region",
                                        entry.key,
                                        entry.label
                                      )
                                    }
                                    className="text-amber-500 hover:text-amber-600"
                                  >
                                    <Star className="w-4 h-4 fill-current" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {favoriteUniversities.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                              Universités
                            </p>
                            <div className="space-y-1.5">
                              {favoriteUniversities.map((entry) => (
                                <div
                                  key={entry.key}
                                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                                >
                                  <GraduationCap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                  <button
                                    className="flex-1 text-left text-sm font-medium text-foreground truncate"
                                    onClick={() => {
                                      onNavigate("universities", entry.label);
                                      onOpenChange(false);
                                    }}
                                  >
                                    {entry.label}
                                  </button>
                                  <button
                                    onClick={() =>
                                      toggleFavorite(
                                        "university",
                                        entry.key,
                                        entry.label
                                      )
                                    }
                                    className="text-amber-500 hover:text-amber-600"
                                  >
                                    <Star className="w-4 h-4 fill-current" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
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

export default FavoritesModal;
