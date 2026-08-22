import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Crown, Check, X, PartyPopper } from "lucide-react";
import { usePro, FREE_FEATURES, PRO_FEATURES } from "@/lib/pro";
import { BMC_URL } from "@/lib/bmc";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onOpenChange,
  reason,
}) => {
  const { isPro, unlock } = usePro();
  const [justUnlocked, setJustUnlocked] = useState(false);

  const handleUnlock = () => {
    unlock();
    setJustUnlocked(true);
  };

  const handleClose = (next: boolean) => {
    if (!next) setJustUnlocked(false);
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
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
                className="fixed left-1/2 top-16 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
              >
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <Dialog.Title className="flex items-center gap-2 font-bold text-foreground">
                      <Crown className="w-5 h-5 text-amber-500" />
                      DataKamer Pro
                    </Dialog.Title>
                    <Dialog.Close className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>

                  <div className="p-5 space-y-5">
                    {isPro || justUnlocked ? (
                      <div className="text-center py-6 space-y-3">
                        <PartyPopper className="w-10 h-10 text-amber-500 mx-auto" />
                        <h3 className="text-lg font-bold text-foreground">
                          Pro débloqué, merci pour votre soutien !
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Les fonctionnalités Pro sont maintenant actives sur
                          cet appareil.
                        </p>
                        <Dialog.Close asChild>
                          <button className="mt-2 px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">
                            Continuer
                          </button>
                        </Dialog.Close>
                      </div>
                    ) : (
                      <>
                        {reason && (
                          <p className="text-sm text-center text-muted-foreground bg-muted/60 rounded-xl px-4 py-3">
                            {reason}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="border border-border rounded-2xl p-4">
                            <p className="font-semibold text-foreground mb-3">
                              Gratuit
                            </p>
                            <ul className="space-y-2">
                              {FREE_FEATURES.map((f) => (
                                <li
                                  key={f}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border-2 border-amber-500/60 rounded-2xl p-4 bg-amber-500/5 relative">
                            <p className="font-semibold text-foreground mb-3 flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-amber-500" /> Pro
                            </p>
                            <ul className="space-y-2">
                              {PRO_FEATURES.map((f) => (
                                <li
                                  key={f}
                                  className="flex items-start gap-2 text-sm text-foreground"
                                >
                                  <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                          <p className="text-sm text-muted-foreground">
                            DataKamer est un projet indépendant et gratuit.
                            Offrez-moi un café pour soutenir son
                            développement, puis débloquez Pro sur cet
                            appareil — c&apos;est un système basé sur la
                            confiance, aucune carte bancaire requise ici.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <a
                              href={BMC_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFDD00] text-[#000000] rounded-xl hover:brightness-95 transition-all text-sm font-semibold shadow-sm"
                            >
                              <Coffee className="w-4 h-4" />
                              Offrir un café
                            </a>
                            <button
                              onClick={handleUnlock}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-semibold shadow-sm"
                            >
                              <Crown className="w-4 h-4" />
                              J&apos;ai soutenu, débloquer Pro
                            </button>
                          </div>
                        </div>
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

export default UpgradeModal;
