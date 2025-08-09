import React from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  ChartBarIcon, 
  AcademicCapIcon, 
  HeartIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'red';
  index: number;
}

const iconMap = {
  users: UsersIcon,
  'chart-bar': ChartBarIcon,
  'academic-cap': AcademicCapIcon,
  heart: HeartIcon,
};

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    accent: 'text-blue-600',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    accent: 'text-green-600',
    border: 'border-green-200',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    accent: 'text-purple-600',
    border: 'border-purple-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    accent: 'text-red-600',
    border: 'border-red-200',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  color,
  index,
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap];
  const colors = colorMap[color];
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center space-x-1">
            <TrendIcon className={`h-4 w-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500">vs last year</span>
          </div>
        </div>
        <div className={`rounded-xl ${colors.bg} p-3`}>
          <IconComponent className={`h-8 w-8 ${colors.icon}`} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${colors.bg}`} />
    </motion.div>
  );
};