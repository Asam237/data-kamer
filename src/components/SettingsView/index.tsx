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
  Globe,
  Moon,
  Sun
} from "lucide-react";

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true
  });
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("fr");
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: "general", name: "Général", icon: Settings },
    { id: "profile", name: "Profil", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Sécurité", icon: Shield },
    { id: "appearance", name: "Apparence", icon: Palette },
    { id: "data", name: "Données", icon: Database }
  ];

  const SettingCard = ({ title, description, children }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      {children}
    </motion.div>
  );

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </SettingCard>

            <SettingCard
              title="Région"
              description="Définissez votre région par défaut"
            >
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organisation
                  </label>
                  <input
                    type="text"
                    placeholder="Votre organisation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </SettingCard>

            <SettingCard
              title="Photo de Profil"
              description="Téléchargez votre photo de profil"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevez des mises à jour par email</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications push</p>
                    <p className="text-sm text-gray-600">Recevez des notifications dans le navigateur</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Mises à jour</p>
                    <p className="text-sm text-gray-600">Notifications sur les nouvelles fonctionnalités</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, updates: !prev.updates }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.updates ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.updates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </SettingCard>

            <SettingCard
              title="Authentification à Deux Facteurs"
              description="Renforcez la sécurité de votre compte"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">2FA activé</p>
                  <p className="text-sm text-gray-600">Protection supplémentaire pour votre compte</p>
                </div>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "light", name: "Clair", icon: Sun },
                  { id: "dark", name: "Sombre", icon: Moon },
                  { id: "auto", name: "Auto", icon: Globe }
                ].map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === themeOption.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <themeOption.icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">{themeOption.name}</p>
                  </button>
                ))}
              </div>
            </SettingCard>

            <SettingCard
              title="Couleur d'Accent"
              description="Choisissez votre couleur préférée"
            >
              <div className="flex space-x-3">
                {[
                  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
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
                <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
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
                  <p className="font-medium text-gray-900">Dernière synchronisation</p>
                  <p className="text-sm text-gray-600">Il y a 2 heures</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Paramètres
        </h1>
        <p className="text-lg text-gray-600">
          Personnalisez votre expérience DataKamer
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 flex-shrink-0"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
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
            <button className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg">
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