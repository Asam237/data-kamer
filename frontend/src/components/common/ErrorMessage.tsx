import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Erreur de chargement',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
        <h3 className="text-lg font-semibold text-red-800">{title}</h3>
      </div>
      
      <p className="text-red-700 mb-4">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Réessayer
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;