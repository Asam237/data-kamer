import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, MapPin, Users } from "lucide-react";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a brief moment
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Data<span className="text-blue-600">Kamer</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
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
              <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center mb-2">
                <item.icon className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-sm text-gray-600">{item.label}</span>
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
          <span className="text-gray-600">
            Chargement de l&apos;application...
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
