import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTheme } from "@/contexts/ThemeContext";

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("fr");
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: "general", name: "Général", icon: Settings },
    { id: "profile", name: "Profil", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Sécurité", icon: Shield },
    { id: "appearance", name: "Apparence", icon: Palette },
    { id: "data", name: "Données", icon: Database },
  ];

  const SettingCard = ({ title, description, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all duration-300"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {children}
    </motion.div>
  );

  const inputClass =
    "w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <SettingCard
              title="Langue"
              description="Choisissez votre langue préférée pour l'interface"
            >
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={inputClass}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </SettingCard>

            <SettingCard
              title="Région"
              description="Définissez votre région par défaut"
            >
              <select className={inputClass}>
                <option value="centre">Centre</option>
                <option value="littoral">Littoral</option>
                <option value="ouest">Ouest</option>
                <option value="nord">Nord</option>
              </select>
            </SettingCard>

            <SettingCard
              title="Fuseau Horaire"
              description="Configurez votre fuseau horaire"
            >
              <select className={inputClass}>
                <option value="WAT">WAT (UTC+1) - Cameroun</option>
                <option value="UTC">UTC (UTC+0)</option>
              </select>
            </SettingCard>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <SettingCard
              title="Informations Personnelles"
              description="Gérez vos informations de profil"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="Votre organisation"
                    className={inputClass}
                  />
                </div>
              </div>
            </SettingCard>

            <SettingCard
              title="Photo de Profil"
              description="Téléchargez votre photo de profil"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Changer la photo
                </button>
              </div>
            </SettingCard>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <SettingCard
              title="Préférences de Notification"
              description="Contrôlez comment vous recevez les notifications"
            >
              <div className="space-y-4">
                {[
                  {
                    key: "email" as const,
                    label: "Notifications par email",
                    hint: "Recevez des mises à jour par email",
                  },
                  {
                    key: "push" as const,
                    label: "Notifications push",
                    hint: "Recevez des notifications dans le navigateur",
                  },
                  {
                    key: "updates" as const,
                    label: "Mises à jour",
                    hint: "Notifications sur les nouvelles fonctionnalités",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[item.key] ? "bg-blue-500" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications[item.key]
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </SettingCard>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <SettingCard
              title="Mot de Passe"
              description="Changez votre mot de passe"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nouveau mot de passe
                  </label>
                  <input type="password" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input type="password" className={inputClass} />
                </div>
              </div>
            </SettingCard>

            <SettingCard
              title="Authentification à Deux Facteurs"
              description="Renforcez la sécurité de votre compte"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">2FA activé</p>
                  <p className="text-sm text-muted-foreground">
                    Protection supplémentaire pour votre compte
                  </p>
                </div>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  Configurer
                </button>
              </div>
            </SettingCard>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <SettingCard
              title="Thème"
              description="Personnalisez l'apparence de l'interface"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "light" as const, name: "Clair", icon: Sun },
                  { id: "dark" as const, name: "Sombre", icon: Moon },
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === themeOption.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-border hover:border-blue-300"
                    }`}
                  >
                    <themeOption.icon className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {themeOption.name}
                    </p>
                  </button>
                ))}
              </div>
            </SettingCard>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <SettingCard
              title="Sauvegarde des Données"
              description="Exportez vos données et préférences"
            >
              <div className="flex space-x-4">
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
                <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer
                </button>
              </div>
            </SettingCard>

            <SettingCard
              title="Synchronisation"
              description="Synchronisez vos données avec le cloud"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Dernière synchronisation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Il y a 2 heures
                  </p>
                </div>
                <button className="flex items-center px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Synchroniser
                </button>
              </div>
            </SettingCard>

            <SettingCard
              title="Réinitialisation"
              description="Réinitialisez vos paramètres aux valeurs par défaut"
            >
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Réinitialiser
              </button>
            </SettingCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Paramètres"
        subtitle="Personnalisez votre expérience DataKamer"
        icon={Settings}
        align="center"
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 lg:w-full flex items-center px-4 lg:px-6 py-3 lg:py-4 text-left whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-b-4 lg:border-b-0 lg:border-r-4 border-blue-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2 lg:mr-3" />
                {tab.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          {renderTabContent()}

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-end"
          >
            <button className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg w-full sm:w-auto">
              <Save className="w-5 h-5 mr-2" />
              Sauvegarder les Modifications
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsView;
