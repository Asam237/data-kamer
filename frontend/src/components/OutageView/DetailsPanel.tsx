import React from "react";
import { ChevronLeft, ChevronRight, Clock, Zap } from "lucide-react";
import { RegionOutage } from "./types";
import { formatDate } from "./constants";

interface DetailsPanelProps {
  selectedRegion: RegionOutage;
  onClose: () => void;
  onPrevRegion: () => void;
  onNextRegion: () => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({
  selectedRegion,
  onClose,
  onPrevRegion,
  onNextRegion,
}) => {
  return (
    <div className="absolute inset-0 z-40 lg:z-auto lg:static w-full lg:w-2/5 bg-card shadow-lg overflow-y-auto transition-all duration-300 lg:border-l border-border">
      <div className="sticky top-0 z-10 bg-card shadow-sm">
        <div className="bg-blue-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
              title="Fermer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold flex-1 text-center">
              {selectedRegion.regionName}
            </h3>
            <div className="w-5"></div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 border-b border-border">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-lg font-bold text-foreground">
                {selectedRegion.outages.data ? selectedRegion.outages.data.length : 0}
              </div>
              <div className="text-xs text-muted-foreground">Coupures</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {selectedRegion.outages.data && selectedRegion.outages.data.length > 0 ? (
          <div className="space-y-4">
            {selectedRegion.outages.data.map((outage, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="bg-muted p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-foreground">
                      {outage.ville} - {outage.quartier}
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {formatDate(outage.prog_date)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Heure de début
                      </span>
                      <span className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        {outage.prog_heure_debut}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Heure de fin
                      </span>
                      <span className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        {outage.prog_heure_fin}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground block mb-1">
                      Raison de la coupure
                    </span>
                    <p className="text-foreground bg-muted p-3 rounded text-sm">
                      {outage.observations}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Zap className="h-12 w-12 text-green-500" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">
              Aucune coupure programmée
            </h4>
            <p className="text-muted-foreground text-center max-w-xs">
              Il n&apos;y a actuellement aucune coupure programmée dans la région{" "}
              {selectedRegion.regionName}.
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-card border-t border-border p-3 flex justify-between">
        <button
          className="px-3 py-2 bg-muted hover:bg-muted/70 text-foreground rounded flex items-center text-sm transition-colors"
          onClick={onPrevRegion}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Région précédente
        </button>
        <button
          className="px-3 py-2 bg-muted hover:bg-muted/70 text-foreground rounded flex items-center text-sm transition-colors"
          onClick={onNextRegion}
        >
          Région suivante
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default DetailsPanel;
