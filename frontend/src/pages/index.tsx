import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  MapPin,
  Users,
  GraduationCap,
  Scale,
  Map,
  Zap,
  Crown,
  Coffee,
  Check,
  Github,
  ArrowRight,
} from "lucide-react";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/pro";
import { BMC_URL } from "@/lib/bmc";

const FEATURES = [
  {
    icon: MapPin,
    title: "Régions",
    description:
      "Explorez les 10 régions du Cameroun : population, superficie, départements et sites touristiques.",
  },
  {
    icon: GraduationCap,
    title: "Universités",
    description:
      "Parcourez les établissements d'enseignement supérieur publics et privés du pays.",
  },
  {
    icon: Scale,
    title: "Comparateur",
    description:
      "Comparez plusieurs régions côte à côte sur leurs indicateurs clés en un coup d'œil.",
  },
  {
    icon: Map,
    title: "Carte interactive",
    description:
      "Visualisez les données géographiques directement sur une carte du Cameroun.",
  },
  {
    icon: Zap,
    title: "Coupures ENEO",
    description:
      "Suivez en temps réel les coupures de courant signalées par région.",
  },
  {
    icon: BarChart3,
    title: "Statistiques avancées",
    description:
      "Analysez les tendances via des graphiques interactifs : population, densité, évolution.",
  },
];

const STATS = [
  { icon: Users, label: "Population" },
  { icon: MapPin, label: "Régions" },
  { icon: BarChart3, label: "Statistiques" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">
              Data<span className="text-blue-600">Kamer</span>
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#fonctionnalites" className="hover:text-foreground transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="hover:text-foreground transition-colors">
              Tarifs
            </a>
            <a
              href="https://github.com/Asam237/data-kamer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Ouvrir l&apos;app
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-4 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block mb-5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            Gratuit, sans carte bancaire
          </span>

          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Data<span className="text-blue-600">Kamer</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            La plateforme moderne pour explorer, comparer et visualiser les
            données du Cameroun : régions, universités, coupures et
            statistiques.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg w-full sm:w-auto justify-center"
            >
              Accéder au tableau de bord
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Asam237/data-kamer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-colors w-full sm:w-auto justify-center"
            >
              <Github className="w-4 h-4" />
              Voir sur GitHub
            </a>
          </div>

          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {STATS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-card border border-border rounded-lg shadow-lg flex items-center justify-center mb-2">
                  <item.icon className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Tout le Cameroun, dans une seule app
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Six vues pensées pour explorer les données rapidement, sur
            ordinateur comme sur mobile.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Un plan pour tout le monde
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            DataKamer reste gratuit et open-source. Le plan Pro sert à
            soutenir le projet — aucun paiement en carte requis.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="font-semibold text-foreground mb-1">Gratuit</p>
            <p className="text-3xl font-bold text-foreground mb-4">0 FCFA</p>
            <ul className="space-y-2.5 mb-6">
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
            <Link
              href="/dashboard"
              className="block text-center px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          <div className="bg-card border-2 border-amber-500/60 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-bl-xl">
              Soutien
            </div>
            <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" /> Pro
            </p>
            <p className="text-3xl font-bold text-foreground mb-4">
              Un café ☕
            </p>
            <ul className="space-y-2.5 mb-6">
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
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFDD00] text-[#000000] rounded-xl text-sm font-semibold hover:brightness-95 transition-all shadow-sm"
            >
              <Coffee className="w-4 h-4" />
              Offrir un café
            </a>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Débloquez Pro depuis les Paramètres après votre don.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DataKamer</p>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/Asam237/data-kamer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/asam_237"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              X (Twitter)
            </a>
            <a
              href={BMC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-500 transition-colors"
            >
              Buy Me a Coffee
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
