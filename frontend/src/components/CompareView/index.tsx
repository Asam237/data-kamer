import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Users,
  MapPinned,
  GraduationCap,
  Building2,
  X,
  Download,
  Crown,
  Lock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import cameroonData from "../../../data/cameroon.json";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { exportToCsv } from "@/lib/export";
import { usePro } from "@/lib/pro";
import UpgradeModal from "@/components/UpgradeModal";

const FREE_MAX_SELECTION = 2;
const PRO_MAX_SELECTION = 6;
const ACCENT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

const CompareView: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { isPro } = usePro();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const maxSelection = isPro ? PRO_MAX_SELECTION : FREE_MAX_SELECTION;

  const regions = cameroonData.regions;

  const toggleRegion = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= maxSelection) {
        if (!isPro) setUpgradeOpen(true);
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedRegions = useMemo(
    () =>
      selectedIds
        .map((id) => regions.find((r) => r.id === id))
        .filter(Boolean) as typeof regions,
    [selectedIds, regions]
  );

  const universityCountFor = (regionName: string) =>
    cameroonData.universities.filter((u) => u.region === regionName).length;

  const chartData = useMemo(
    () =>
      selectedRegions.map((r) => ({
        name: r.name,
        Population: r.population,
        "Superficie (km²)": r.area,
        Densité: Math.round(r.population / r.area),
      })),
    [selectedRegions]
  );

  const handleExport = () => {
    if (!isPro) {
      setUpgradeOpen(true);
      return;
    }
    exportToCsv(
      "comparaison-regions",
      selectedRegions.map((r) => ({
        Région: r.name,
        Capitale: r.capital,
        Population: r.population,
        "Superficie (km²)": r.area,
        "Densité (hab/km²)": Math.round(r.population / r.area),
        Départements: r.departments.length,
        Universités: universityCountFor(r.name),
      }))
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Comparateur de régions"
        subtitle="Sélectionnez jusqu'à 3 régions pour comparer leurs données clés côte à côte"
        icon={Scale}
        actions={
          selectedRegions.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium shadow-sm w-full sm:w-auto"
            >
              {isPro ? (
                <Download className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Exporter
            </button>
          )
        }
      />

      {!isPro && (
        <button
          onClick={() => setUpgradeOpen(true)}
          className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 hover:bg-amber-500/15 transition-colors"
        >
          <Crown className="w-4 h-4" />
          Passez à Pro pour comparer jusqu&apos;à {PRO_MAX_SELECTION} régions
          et exporter en CSV
        </button>
      )}

      {/* Region picker */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {selectedIds.length}/{maxSelection} régions sélectionnées
          {!isPro && ` (limite gratuite)`}
        </p>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => {
            const isSelected = selectedIds.includes(region.id);
            const disabled = !isSelected && selectedIds.length >= maxSelection;
            return (
              <button
                key={region.id}
                onClick={() => toggleRegion(region.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  isSelected
                    ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                    : disabled
                    ? "border-border text-muted-foreground/50 cursor-not-allowed"
                    : "border-border text-foreground hover:border-blue-400 hover:text-blue-500"
                }`}
              >
                {region.name}
              </button>
            );
          })}
        </div>
      </div>

      {selectedRegions.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Aucune région sélectionnée"
          description="Choisissez au moins deux régions ci-dessus pour lancer la comparaison."
        />
      ) : (
        <>
          {/* Side-by-side cards */}
          <div
            className={`grid grid-cols-1 gap-4 sm:gap-6 ${
              selectedRegions.length === 1
                ? "sm:grid-cols-1 max-w-md"
                : selectedRegions.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
            style={{
              gridTemplateColumns:
                selectedRegions.length > 3
                  ? `repeat(auto-fit, minmax(220px, 1fr))`
                  : undefined,
            }}
          >
            <AnimatePresence>
              {selectedRegions.map((region, index) => (
                <motion.div
                  key={region.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
                >
                  <div
                    className="p-5 text-white flex items-center justify-between"
                    style={{ backgroundColor: ACCENT_COLORS[index] }}
                  >
                    <div>
                      <h3 className="text-lg font-bold">{region.name}</h3>
                      <p className="text-xs opacity-80">
                        Capitale : {region.capital}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleRegion(region.id)}
                      className="hover:bg-white/20 rounded-full p-1.5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" /> Population
                      </span>
                      <span className="font-semibold text-foreground">
                        {region.population.toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPinned className="w-4 h-4" /> Superficie
                      </span>
                      <span className="font-semibold text-foreground">
                        {region.area.toLocaleString("fr-FR")} km²
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" /> Densité
                      </span>
                      <span className="font-semibold text-foreground">
                        {Math.round(region.population / region.area)} hab/km²
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="w-4 h-4" /> Universités
                      </span>
                      <span className="font-semibold text-foreground">
                        {universityCountFor(region.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Départements ({region.departments.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {region.departments.map((dept) => (
                          <span
                            key={dept}
                            className="px-2 py-1 bg-muted text-foreground text-xs rounded-full"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Comparison chart */}
          {selectedRegions.length > 1 && (
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Population &amp; superficie comparées
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Population" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="Superficie (km²)"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="Débloquez le comparateur étendu (jusqu'à 6 régions) et l'export CSV."
      />
    </div>
  );
};

export default CompareView;
