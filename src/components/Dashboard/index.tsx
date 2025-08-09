import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  MapPin,
  GraduationCap,
  Globe,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Pie,
} from "recharts";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    text: string;
    bg: string;
    gradient: string;
  };
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  trend,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className="group relative"
  >
    <div
      className={`absolute -inset-0.5 bg-gradient-to-r ${color.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300`}
    ></div>
    <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">
            {title}
          </p>
          <p className={`text-3xl font-bold ${color.text} tracking-tight mt-1`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  trend.isPositive ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-2xl ${color.bg} bg-opacity-20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon className={`w-8 h-8 ${color.text}`} />
        </div>
      </div>
    </div>
  </motion.div>
);

interface DashboardData {
  totalPopulation: number;
  totalRegions: number;
  totalDepartments: number;
  totalUniversities: number;
  capital: string;
  totalArea: number;
  currency: string;
  officialLanguages: string[];
}

interface DashboardProps {
  data: DashboardData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Chargement des données...</p>
        </motion.div>
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      title: "Population Totale",
      value: data.totalPopulation,
      icon: Users,
      color: {
        text: "text-blue-600",
        bg: "bg-blue-100",
        gradient: "from-blue-400 to-blue-600",
      },
      description: "Habitants du Cameroun",
      trend: { value: 2.8, isPositive: true },
    },
    {
      title: "Régions",
      value: data.totalRegions,
      icon: MapPin,
      color: {
        text: "text-emerald-600",
        bg: "bg-emerald-100",
        gradient: "from-emerald-400 to-emerald-600",
      },
      description: "Divisions administratives",
      trend: { value: 0, isPositive: true },
    },
    {
      title: "Départements",
      value: data.totalDepartments,
      icon: Globe,
      color: {
        text: "text-purple-600",
        bg: "bg-purple-100",
        gradient: "from-purple-400 to-purple-600",
      },
      description: "Subdivisions",
      trend: { value: 0, isPositive: true },
    },
    {
      title: "Universités",
      value: data.totalUniversities,
      icon: GraduationCap,
      color: {
        text: "text-orange-600",
        bg: "bg-orange-100",
        gradient: "from-orange-400 to-orange-600",
      },
      description: "Institutions publiques",
      trend: { value: 12.5, isPositive: true },
    },
  ];

  // Sample data for charts
  const populationData = [
    { name: "Centre", population: 4665000, area: 68953 },
    { name: "Extrême-Nord", population: 4653000, area: 34263 },
    { name: "Littoral", population: 3728000, area: 20248 },
    { name: "Nord", population: 2445000, area: 66090 },
    { name: "Nord-Ouest", population: 2037000, area: 17300 },
    { name: "Ouest", population: 1960000, area: 13892 },
    { name: "Sud-Ouest", population: 1553000, area: 25410 },
    { name: "Adamaoua", population: 1010000, area: 63701 },
    { name: "Est", population: 801000, area: 109002 },
    { name: "Sud", population: 775000, area: 47191 },
  ];

  const universityData = [
    { name: "Public", value: 11, color: "#3B82F6" },
    { name: "Privé", value: 15, color: "#10B981" },
  ];

  const growthData = [
    { year: "2018", population: 25216000 },
    { year: "2019", population: 25876000 },
    { year: "2020", population: 26545000 },
    { year: "2021", population: 27224000 },
    { year: "2022", population: 27914000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Tableau de Bord DataKamer
        </h1>
        <p className="text-lg text-gray-600">
          Tout savoir sur le Cameroun - Statistiques et informations clés
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Population by Region Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Population par Région
            </h3>
            <BarChart3 className="w-6 h-6 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={populationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value.toLocaleString(), "Population"]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
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

        {/* Universities Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Répartition des Universités
            </h3>
            <PieChart className="w-6 h-6 text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={universityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {universityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, "Universités"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {universityData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Area by Region */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Superficie par Région
            </h3>
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={populationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                  value.toLocaleString() + " km²",
                  "Superficie",
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
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
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Évolution de la Population
            </h3>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value.toLocaleString(), "Population"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="population"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#10B981", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* General Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Informations Générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Capitale", value: data.capital, icon: MapPin },
            {
              label: "Superficie",
              value: `${data.totalArea.toLocaleString()} km²`,
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
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-3">
                <item.icon className="w-5 h-5 text-blue-500 mr-2" />
                <p className="text-sm font-medium text-gray-500">
                  {item.label}
                </p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
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
