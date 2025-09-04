import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  TrendingUp,
  Users,
  MapPin,
  GraduationCap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Filter,
  Download,
} from "lucide-react";
import { useRegions } from "@/hooks/useRegions";
import { useUniversities } from "@/hooks/useUniversities";
import { useOverview } from "@/hooks/useOverview";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

interface StatsViewProps {}

const StatsView: React.FC<StatsViewProps> = () => {
  const [activeChart, setActiveChart] = useState<string>("population");
  const [timeRange, setTimeRange] = useState<string>("all");

  // Utiliser les hooks pour récupérer les données du backend
  const {
    regions,
    loading: regionsLoading,
    error: regionsError,
    refetch: refetchRegions,
  } = useRegions();
  const {
    universities,
    loading: universitiesLoading,
    error: universitiesError,
    refetch: refetchUniversities,
  } = useUniversities();
  const {
    overview,
    loading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useOverview();

  const loading = regionsLoading || universitiesLoading || overviewLoading;
  const error = regionsError || universitiesError || overviewError;

  // Fonction pour relancer toutes les requêtes
  const handleRetry = () => {
    refetchRegions();
    refetchUniversities();
    refetchOverview();
  };

  // Affichage du loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">
            Chargement des données...
          </p>
          <p className="text-gray-500 mt-2">
            Récupération des informations sur les coupures ENEO
          </p>
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-8">
        <ErrorMessage
          title="Erreur de chargement des statistiques"
          message={error}
          onRetry={handleRetry}
          className="max-w-md"
        />
      </div>
    );
  }

  // Vérifier que toutes les données sont disponibles
  if (!regions || !universities || !overview) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Aucune donnée disponible</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Process data for charts
  const regionData = regions
    .map((region) => ({
      name:
        region.name.length > 8
          ? region.name.substring(0, 8) + "..."
          : region.name,
      fullName: region.name,
      population: region.population,
      area: region.area,
      density: Math.round(region.population / region.area),
      departments: region.departments.length,
    }))
    .sort((a, b) => b.population - a.population);

  const universityData = universities.map((uni) => ({
    name: uni.name.length > 15 ? uni.name.substring(0, 15) + "..." : uni.name,
    fullName: uni.name,
    students: uni.students || 0,
    founded: uni.founded || new Date().getFullYear(),
    age: uni.founded ? new Date().getFullYear() - uni.founded : 0,
    region: uni.region,
    type: uni.type || "Public",
  }));

  const regionStats = regions.map((region) => ({
    region: region.name,
    population: region.population,
    area: region.area,
    density: Math.round(region.population / region.area),
    universities: universities.filter((uni) => uni.region === region.id).length,
  }));

  const universityByRegion = regions.map((region) => ({
    name: region.name,
    universities: universities.filter((uni) => uni.region === region.id).length,
    students: universities
      .filter((uni) => uni.region === region.id)
      .reduce((sum, uni) => sum + (uni.students || 0), 0),
  }));

  const universityTypes = [
    {
      name: "Publiques",
      value: universities.filter((uni) => uni.type === "Public" || !uni.type)
        .length,
      color: "#3B82F6",
    },
    {
      name: "Privées",
      value: universities.filter((uni) => uni.type === "Privé").length,
      color: "#10B981",
    },
  ];

  const populationDistribution = [
    {
      range: "< 1M",
      count: regions.filter((r) => r.population < 1000000).length,
      color: "#EF4444",
    },
    {
      range: "1M - 2M",
      count: regions.filter(
        (r) => r.population >= 1000000 && r.population < 2000000
      ).length,
      color: "#F59E0B",
    },
    {
      range: "2M - 3M",
      count: regions.filter(
        (r) => r.population >= 2000000 && r.population < 3000000
      ).length,
      color: "#10B981",
    },
    {
      range: "3M+",
      count: regions.filter((r) => r.population >= 3000000).length,
      color: "#3B82F6",
    },
  ];

  const radarData = regionData.slice(0, 6).map((region) => ({
    region: region.name,
    population: Math.round(region.population / 100000),
    area: Math.round(region.area / 1000),
    density: region.density,
    universities:
      universityByRegion.find((u) => u.name === region.fullName)
        ?.universities || 0,
  }));

  const scatterData = regionData.map((region) => ({
    x: region.area,
    y: region.population,
    z: region.density,
    name: region.fullName,
  }));

  const chartOptions = [
    { id: "population", name: "Population", icon: Users },
    { id: "universities", name: "Universités", icon: GraduationCap },
    { id: "comparison", name: "Comparaison", icon: BarChart3 },
    { id: "distribution", name: "Distribution", icon: PieChartIcon },
    { id: "trends", name: "Tendances", icon: TrendingUp },
    { id: "radar", name: "Radar", icon: Target },
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <p
              className={`text-sm ${
                change > 0 ? "text-green-600" : "text-red-600"
              } flex items-center mt-1`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? "+" : ""}
              {change}%
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  const renderChart = () => {
    switch (activeChart) {
      case "population":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  name === "population" ? value.toLocaleString() : value,
                  name === "population" ? "Population" : "Densité (hab/km²)",
                ]}
                labelFormatter={(label) =>
                  regionData.find((r) => r.name === label)?.fullName || label
                }
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="population" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="density" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case "universities":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={universityByRegion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="universities"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="students"
                stroke="#F59E0B"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={regionStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="density"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="universities"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "distribution":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={universityTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {universityTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={populationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {populationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case "trends":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={universityData
                .filter((uni) => uni.founded)
                .sort((a, b) => a.founded - b.founded)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="founded" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => `Année: ${value}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "radar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="region" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fontSize: 12 }} />
              <Radar
                name="Métriques"
                dataKey="population"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Statistiques Avancées
        </h1>
        <p className="text-lg text-gray-600">
          Analyses détaillées et visualisations interactives des données du
          Cameroun
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Population Totale"
          value={overview.totalPopulation.toLocaleString()}
          icon={Users}
          color="text-blue-600"
          change={2.8}
        />
        <StatCard
          title="Densité Moyenne"
          value={overview.averageDensity + " hab/km²"}
          icon={MapPin}
          color="text-green-600"
          change={1.2}
        />
        <StatCard
          title="Étudiants Total"
          value={overview.totalStudents.toLocaleString()}
          icon={GraduationCap}
          color="text-purple-600"
          change={5.4}
        />
        <StatCard
          title="Âge Moyen Universités"
          value={overview.averageUniversityAge + " ans"}
          icon={Activity}
          color="text-orange-600"
          change={-0.8}
        />
      </div>

      {/* Chart Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {chartOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveChart(option.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeChart === option.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <option.icon className="w-4 h-4 mr-2" />
                {option.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les données</option>
              <option value="recent">Données récentes</option>
              <option value="historical">Données historiques</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          {renderChart()}
        </motion.div>
      </motion.div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Top 5 Régions par Population
          </h3>
          <div className="space-y-3">
            {regionData.slice(0, 5).map((region, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium">{region.fullName}</span>
                </div>
                <span className="text-gray-600">
                  {region.population.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Universités par Région
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                name="Superficie"
                unit=" km²"
                tick={{ fontSize: 12 }}
              />
              <YAxis dataKey="y" name="Population" tick={{ fontSize: 12 }} />
              <ZAxis
                dataKey="z"
                range={[50, 400]}
                name="Densité"
                unit=" hab/km²"
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value, name) => [
                  name === "x"
                    ? value.toLocaleString() + " km²"
                    : name === "y"
                    ? value.toLocaleString()
                    : value + " hab/km²",
                  name === "x"
                    ? "Superficie"
                    : name === "y"
                    ? "Population"
                    : "Densité",
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Scatter dataKey="y" fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsView;
