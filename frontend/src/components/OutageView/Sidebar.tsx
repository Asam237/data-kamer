import React from "react";
import { ChevronRight, MapPin, Search, X, Zap } from "lucide-react";
import { OutageMatch, RegionOutage } from "./types";
import { formatDate, getOutageKey, getRegionColor } from "./constants";

interface SidebarProps {
  outageData: RegionOutage[];
  selectedRegion: RegionOutage | null;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  matches: OutageMatch[];
  showRegions: boolean;
  onToggleShowRegions: () => void;
  totalOutages: number;
  pendingKey: string | null;
  onSelectRegion: (region: RegionOutage) => void;
  onSelectMatch: (match: OutageMatch) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  outageData,
  selectedRegion,
  searchTerm,
  onSearchTermChange,
  matches,
  showRegions,
  onToggleShowRegions,
  totalOutages,
  pendingKey,
  onSelectRegion,
  onSelectMatch,
}) => {
  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="absolute lg:relative inset-y-0 left-0 z-30 lg:z-10 w-80 max-w-[85vw] bg-card border-r border-border shadow-lg overflow-hidden flex flex-col">
      <div className="bg-muted border-b p-4">
        <h2 className="font-bold text-foreground flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Régions ({outageData.length})
        </h2>

        <div className="mt-3 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une ville ou un quartier..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm ? (
              <button
                onClick={() => onSearchTermChange("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="absolute right-3 top-2.5 text-muted-foreground h-4 w-4" />
            )}
          </div>
          {isSearching && (
            <p className="mt-2 text-xs text-muted-foreground">
              {matches.length} correspondance{matches.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            checked={showRegions}
            onChange={onToggleShowRegions}
            id="showRegions"
            className="mr-2"
          />
          <label
            htmlFor="showRegions"
            className="text-sm font-medium text-foreground"
          >
            Afficher les marqueurs sur la carte
          </label>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-3">
        {isSearching ? (
          matches.length > 0 ? (
            <ul className="space-y-2">
              {matches.map((match) => {
                const key = getOutageKey(match.region.regionCode, match.outage);
                const isPending = pendingKey === key;
                return (
                  <li
                    key={key}
                    className={`rounded-lg overflow-hidden transition-all duration-200 border ${
                      isPending
                        ? "cursor-wait opacity-70"
                        : "cursor-pointer"
                    } ${
                      selectedRegion?.regionCode === match.region.regionCode
                        ? "border-blue-500 shadow-md"
                        : "border-border hover:border-border hover:shadow-sm"
                    }`}
                    onClick={() => !isPending && onSelectMatch(match)}
                  >
                    <div className="flex items-center p-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold flex-shrink-0"
                        style={{
                          backgroundColor: getRegionColor(match.region.outages),
                        }}
                      >
                        {isPending ? (
                          <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        ) : (
                          <MapPin className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {match.outage.ville} - {match.outage.quartier}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {match.region.regionName} ·{" "}
                          {formatDate(match.outage.prog_date)}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-muted-foreground font-medium">
                Aucune ville ou quartier trouvé
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Essayez avec un autre terme de recherche
              </p>
              <button
                className="mt-4 px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70 transition-colors text-sm"
                onClick={() => onSearchTermChange("")}
              >
                Effacer la recherche
              </button>
            </div>
          )
        ) : (
          <ul className="space-y-2">
            {outageData.map((region) => (
              <li
                key={region.regionCode}
                className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                  selectedRegion?.regionCode === region.regionCode
                    ? "border-blue-500 shadow-md"
                    : "border-border hover:border-border hover:shadow-sm"
                }`}
                onClick={() => onSelectRegion(region)}
              >
                <div className="flex items-center p-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold"
                    style={{
                      backgroundColor: getRegionColor(region.outages),
                    }}
                  >
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{region.regionName}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      {region.outages.data && region.outages.data.length > 0 ? (
                        <span className="text-red-500 font-medium">
                          {region.outages.data.length} coupure(s)
                        </span>
                      ) : (
                        <span className="text-green-500">Aucune coupure</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-muted p-3 border-t">
        <div className="text-sm text-muted-foreground text-center">
          Total: {totalOutages} coupure(s) programmée(s)
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
