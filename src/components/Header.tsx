import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white"
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative container mx-auto px-6 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Data Kamer</h1>
                <p className="text-blue-100">Données et statistiques du Cameroun</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-blue-100">
            <GlobeAltIcon className="h-5 w-5" />
            <span className="text-sm">Cameroun • 2024</span>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-xl text-blue-50 max-w-2xl">
            Explorez les données économiques, démographiques et sociales du Cameroun 
            à travers des visualisations interactives et modernes.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.header>
  );
};