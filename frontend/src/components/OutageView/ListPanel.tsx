import React from "react";
import { Calendar, Clock, MapPin, Zap } from "lucide-react";
import { RegionOutage } from "./types";
import { formatDate } from "./constants";

interface ListPanelProps {
  outageData: RegionOutage[];
  totalOutages: number;
}

const ListPanel: React.FC<ListPanelProps> = ({ outageData, totalOutages }) => {
  return (
    <div className="w-full p-3 sm:p-4 overflow-y-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        Liste des coupures programmées
      </h2>

      {totalOutages === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-500 mb-2">
            <Zap className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-green-800">
            Aucune coupure programmée
          </h3>
          <p className="text-green-600 mt-1">
            Toutes les régions sont actuellement alimentées
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {outageData
            .filter(
              (region) => region.outages.data && region.outages.data.length > 0
            )
            .map((region) => (
              <div
                key={region.regionCode}
                className="bg-card rounded-lg shadow-md overflow-hidden"
              >
                <div className="bg-blue-700 text-white p-3 flex justify-between items-center">
                  <h3 className="font-bold">{region.regionName}</h3>
                  <span className="bg-card text-blue-700 px-2 py-0.5 rounded-full text-sm font-medium">
                    {region.outages.data.length} coupure(s)
                  </span>
                </div>
                <div className="p-4">
                  <div className="divide-y divide-border">
                    {region.outages.data.map((outage, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap gap-4 mb-2">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="font-medium">{outage.ville}</span>
                            <span className="mx-1">-</span>
                            <span>{outage.quartier}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                            <span>{formatDate(outage.prog_date)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <span>
                              {outage.prog_heure_debut} - {outage.prog_heure_fin}
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground bg-muted p-3 rounded text-sm mt-2">
                          {outage.observations}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ListPanel;
