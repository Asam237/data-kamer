import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, MapPin, Users, Monitor } from "lucide-react";

const Index = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Vérifier la taille de l'écran
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px est généralement la limite pour les tablettes
    };

    // Vérifier au chargement
    checkScreenSize();

    // Vérifier lors du redimensionnement
    window.addEventListener("resize", checkScreenSize);

    // Redirect to dashboard après un bref moment (seulement si pas mobile)
    let timer: any;
    if (!isMobile) {
      timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [router, isMobile]);

  // Afficher le message pour mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Data<span className="text-blue-600">Kamer</span>
            </h1>
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Application Desktop uniquement
              </h2>
              <p className="text-muted-foreground mb-4">
                Pour une meilleure expérience de visualisation des données,
                veuillez vous connecter depuis un ordinateur.
              </p>
              <div className="bg-blue-500/10 rounded-lg p-4 text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium mb-1">
                  📊 Tableaux de bord interactifs
                </p>
                <p className="font-medium mb-1">📈 Graphiques détaillés</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Affichage normal pour desktop
  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Data<span className="text-blue-600">Kamer</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
            Plateforme moderne de visualisation et d&apos;analyse des données du
            Cameroun
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center justify-center space-x-8 mb-8"
        >
          {[
            { icon: Users, label: "Population" },
            { icon: MapPin, label: "Régions" },
            { icon: BarChart3, label: "Statistiques" },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-card border border-border rounded-lg shadow-lg flex items-center justify-center mb-2">
                <item.icon className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex items-center justify-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mr-3"></div>
          <span className="text-muted-foreground">
            Chargement de l&apos;application...
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
