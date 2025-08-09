import React from "react";
import {
  UsersIcon,
  MapIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

// Enhanced type definitions with more descriptive types
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: {
    text: string;
    bg: string;
  };
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  description,
}) => (
  <div className="group relative">
    <div className="absolute -inset-0.5 rounded-xl group-hover:opacity-100 transition duration-300 group-hover:blur-lg"></div>
    <div className="relative bg-white rounded-xl shadow-md p-6 border border-gray-100 transform transition-all duration-300 hover:scale-105 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 tracking-wide">
            {title}
          </p>
          <p className={`text-3xl font-extrabold ${color.text} tracking-tight`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-gray-400 mt-1 opacity-80">
              {description}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${color.bg} bg-opacity-20 transition-transform group-hover:rotate-6`}
        >
          <Icon className={`w-8 h-8 ${color.text} opacity-80`} />
        </div>
      </div>
    </div>
  </div>
);

// More comprehensive type definition
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
  if (!data)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading data...</p>
        </div>
      </div>
    );

  const stats: StatCardProps[] = [
    {
      title: "Total Population",
      value: data.totalPopulation,
      icon: UsersIcon,
      color: {
        text: "text-blue-600",
        bg: "bg-blue-100",
      },
      description: "Total Inhabitants",
    },
    {
      title: "Regions",
      value: data.totalRegions,
      icon: MapIcon,
      color: {
        text: "text-green-600",
        bg: "bg-green-100",
      },
      description: "Administrative Divisions",
    },
    {
      title: "Departments",
      value: data.totalDepartments,
      icon: GlobeAltIcon,
      color: {
        text: "text-purple-600",
        bg: "bg-purple-100",
      },
      description: "Subdivisions",
    },
    {
      title: "Universities",
      value: data.totalUniversities,
      icon: BuildingLibraryIcon,
      color: {
        text: "text-orange-600",
        bg: "bg-orange-100",
      },
      description: "Public Institutions",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Overview Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </section>

        {/* General Information */}
        <section className="mt-12">
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Capital", value: data.capital },
                {
                  label: "Area",
                  value: `${data.totalArea.toLocaleString()} km²`,
                },
                { label: "Currency", value: data.currency },
                {
                  label: "Official Languages",
                  value: data.officialLanguages.join(", "),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition"
                >
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {item.label}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Placeholder Charts */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {["Population by Region", "Area by Region"].map((title, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
                {title}
              </h3>
              <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 font-medium">Chart Coming Soon</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
