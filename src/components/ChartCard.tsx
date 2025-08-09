import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  index: number;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children, 
  index, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={className}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-80">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};