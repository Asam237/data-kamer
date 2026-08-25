import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  GraduationCap,
  Globe,
  TrendingUp,
  BarChart3,
  Activity,
  Star,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import cameroonData from "../../../data/cameroon.json";
import StatCard from "@/components/ui/StatCard";
import PageHeader from "@/components/ui/PageHeader";
import SourceBadge from "@/components/ui/SourceBadge";
import { useFavorites } from "@/lib/favorites";
import { SOURCES } from "@/lib/sources";
import type { ViewType } from "@/components/CommandPalette";

interface DashboardData {
  totalPopulation: number;
  totalRegions: number;
  totalDepartments: number;
  capital: string;
  totalArea: number;
  currency: string;
  officialLanguages: string[];
}

interface DashboardProps {
  data: DashboardData | null;
  onNavigate?: (view: ViewType, search?: string) => void;
}

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  color: "hsl(var(--foreground))",
};

const Dashboard: React.FC<DashboardProps> = ({ data, onNavigate }) => {
  const { favorites } = useFavorites();

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">
            Chargement des données...
          </p>
        </motion.div>
      </div>
    );
  }

  const totalUniversities = cameroonData.universities.length;

  const stats = [
    {
      title: "Population Totale",
      value: data.totalPopulation,
      icon: Users,
      accent: "blue" as const,
      description: "Habitants du Cameroun",
      source: "demographics" as const,
    },
    {
      title: "Régions",
      value: data.totalRegions,
      icon: MapPin,
      accent: "emerald" as const,
      description: "Divisions administratives",
      source: "demographics" as const,
    },
    {
      title: "Départements",
      value: data.totalDepartments,
      icon: Globe,
      accent: "purple" as const,
      description: "Subdivisions",
      source: "demographics" as const,
    },
    {
      title: "Universités",
      value: totalUniversities,
      icon: GraduationCap,
      accent: "orange" as const,
      description: "Institutions recensées",
      source: "institutions" as const,
    },
  ];

  const populationData = cameroonData.regions.map((region: any) => ({
    name: region.name,
    population: region.population,
    area: region.area,
  }));

  const growthData = [
    { year: "2018", population: 24806000 },
    { year: "2019", population: 25506000 },
    { year: "2020", population: 26211000 },
    { year: "2021", population: 26916000 },
    { year: "2022", population: 27633000 },
    { year: "2023", population: 28373000 },
    { year: "2024", population: 29124000 },
    { year: "2025", population: cameroonData.overview.totalPopulation },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Tableau de Bord DataKamer"
        subtitle="Tout savoir sur le Cameroun — statistiques et informations clés"
        icon={TrendingUp}
        align="center"
        source="demographics"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.05} />
        ))}
      </div>

      {/* Favorites quick access */}
      {favorites.length > 0 && onNavigate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-sm p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">Vos favoris</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => (
              <button
                key={`${fav.kind}-${fav.key}`}
                onClick={() =>
                  onNavigate(
                    fav.kind === "region" ? "regions" : "universities",
                    fav.label
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm text-foreground hover:bg-blue-500 hover:text-white transition-colors"
              >
                {fav.label}
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Population by Region Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Population par Région
              </h3>
              <SourceBadge source="demographics" iconOnly />
            </div>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={populationData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString("fr-FR"),
                  "Population",
                ]}
                contentStyle={chartTooltipStyle}
              />
              <Bar
                dataKey="population"
                fill="url(#populationGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient
                  id="populationGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Area by Region */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Superficie par Région
              </h3>
              <SourceBadge source="demographics" iconOnly />
            </div>
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={populationData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString("fr-FR") + " km²",
                  "Superficie",
                ]}
                contentStyle={chartTooltipStyle}
              />
              <Area
                type="monotone"
                dataKey="area"
                stroke="#8B5CF6"
                fill="url(#areaGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Population Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 border border-border lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Évolution de la Population
              </h3>
              <SourceBadge source="demographics" iconOnly />
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [
                  Number(value).toLocaleString("fr-FR"),
                  "Population",
                ]}
                contentStyle={chartTooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="population"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#10B981", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* General Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl shadow-sm p-5 sm:p-8 border border-border"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <h3 className="text-2xl font-bold text-foreground text-center">
            Informations Générales
          </h3>
          <SourceBadge source="demographics" iconOnly />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Capitale", value: data.capital, icon: MapPin },
            {
              label: "Superficie",
              value: `${data.totalArea.toLocaleString("fr-FR")} km²`,
              icon: Globe,
            },
            { label: "Monnaie", value: data.currency, icon: Activity },
            {
              label: "Langues Officielles",
              value: data.officialLanguages.join(", "),
              icon: Users,
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-3">
                <item.icon className="w-5 h-5 text-blue-500 mr-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
