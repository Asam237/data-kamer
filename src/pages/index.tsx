import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { ChartCard } from '@/components/ChartCard';
import {
  populationData,
  economicData,
  educationData,
  regionsData,
  healthData,
  statsCards,
} from '@/data/cameroonData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  cutout: '60%',
};

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Stats Cards */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => (
              <StatsCard key={stat.title} {...stat} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ChartCard title="Évolution de la Population" index={0}>
            <Line data={populationData} options={chartOptions} />
          </ChartCard>

          <ChartCard title="Répartition du PIB par Secteur" index={1}>
            <Doughnut data={economicData} options={doughnutOptions} />
          </ChartCard>

          <ChartCard title="Taux de Scolarisation par Niveau" index={2}>
            <Bar data={educationData} options={chartOptions} />
          </ChartCard>

          <ChartCard title="Indicateurs de Santé" index={3}>
            <Line data={healthData} options={chartOptions} />
          </ChartCard>
        </div>

        {/* Full Width Chart */}
        <ChartCard title="Population par Région" index={4} className="mb-12">
          <Bar data={regionsData} options={chartOptions} />
        </ChartCard>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center py-8 border-t border-gray-200 bg-white/50 rounded-2xl backdrop-blur-sm"
        >
          <div className="space-y-2">
            <p className="text-gray-600 font-medium">
              Data Kamer - Plateforme de visualisation des données du Cameroun
            </p>
            <p className="text-sm text-gray-500">
              Développé par{' '}
              <a 
                href="https://abbasali.cm" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Abba Sali Aboubakar Mamate
              </a>
              {' '}• Sources: Institut National de la Statistique du Cameroun
            </p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;