import React from "react";
import { Map, Marker, Overlay, ZoomControl } from "pigeon-maps";
import { Layers, Minus, Plus, Target, Zap } from "lucide-react";
import { BoundsChanged, RegionOutage } from "./types";
import { REGION_COORDINATES, getRegionColor } from "./constants";

interface RegionMarkersProps {
  outageData: RegionOutage[];
  selectedRegionCode: string | null;
  onMarkerClick: (region: RegionOutage) => void;
  onMarkerHover: (region: RegionOutage) => void;
  onMarkerLeave: () => void;
}

// Mémoïsé: les marqueurs ne doivent pas se re-rendre quand seul l'état du
// tooltip ou du panneau de détails change dans le composant parent.
const RegionMarkers: React.FC<RegionMarkersProps> = React.memo(
  ({
    outageData,
    selectedRegionCode,
    onMarkerClick,
    onMarkerHover,
    onMarkerLeave,
  }) => (
    <>
      {outageData.map((region) => {
        const outageCount = region.outages.data
          ? region.outages.data.length
          : 0;
        const isSelected = selectedRegionCode === region.regionCode;
        return (
          <Overlay
            key={region.regionCode}
            anchor={REGION_COORDINATES[region.regionName]}
            offset={[0, 0]}
          >
            <div
              className={`cursor-pointer transition-transform ${
                isSelected ? "scale-110" : "hover:scale-105"
              }`}
              onClick={() => onMarkerClick(region)}
              onMouseOver={() => onMarkerHover(region)}
              onMouseOut={onMarkerLeave}
            >
              <div className="relative flex flex-col items-center">
                {outageCount > 0 && (
                  <div className="absolute -top-2 bg-card text-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-gray-800 z-10">
                    {outageCount}
                  </div>
                )}
                <div
                  className={`rounded-full p-2 shadow-lg ${
                    isSelected ? "ring-4 ring-blue-500" : ""
                  }`}
                  style={{ backgroundColor: getRegionColor(region.outages) }}
                >
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </Overlay>
        );
      })}
    </>
  )
);
RegionMarkers.displayName = "RegionMarkers";

interface MapPanelProps {
  outageData: RegionOutage[];
  center: [number, number];
  zoom: number;
  onBoundsChanged: (bounds: BoundsChanged) => void;
  selectedRegion: RegionOutage | null;
  showRegions: boolean;
  onMarkerClick: (region: RegionOutage) => void;
  tooltipRegion: RegionOutage | null;
  showTooltip: boolean;
  detailsOpen: boolean;
  onMarkerHover: (region: RegionOutage) => void;
  onMarkerLeave: () => void;
  userLocation: [number, number] | null;
  locationError: string | null;
  locationPrompted: boolean;
  onRequestUserLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterOnUser: () => void;
}

const MapPanel: React.FC<MapPanelProps> = ({
  outageData,
  center,
  zoom,
  onBoundsChanged,
  selectedRegion,
  showRegions,
  onMarkerClick,
  tooltipRegion,
  showTooltip,
  detailsOpen,
  onMarkerHover,
  onMarkerLeave,
  userLocation,
  locationError,
  locationPrompted,
  onRequestUserLocation,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterOnUser,
}) => {
  return (
    <div
      className={`w-full ${
        detailsOpen ? "lg:w-3/5" : ""
      } transition-all duration-300 relative`}
    >
      <Map
        provider={(x, y, z) =>
          `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
        }
        center={center}
        zoom={zoom}
        onBoundsChanged={onBoundsChanged}
        attribution={false}
        metaWheelZoom={true}
        twoFingerDrag={true}
      >
        {userLocation && (
          <Marker anchor={userLocation} payload={1} width={50} color="#007bff" />
        )}

        {showRegions && (
          <RegionMarkers
            outageData={outageData}
            selectedRegionCode={selectedRegion?.regionCode ?? null}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
            onMarkerLeave={onMarkerLeave}
          />
        )}

        {showTooltip && tooltipRegion && !detailsOpen && (
          <Overlay
            anchor={REGION_COORDINATES[tooltipRegion.regionName]}
            offset={[0, -20]}
          >
            <div className="bg-card px-3 py-1.5 rounded shadow-lg text-sm font-medium border border-border pointer-events-none">
              {tooltipRegion.regionName} -{" "}
              {tooltipRegion.outages.data ? tooltipRegion.outages.data.length : 0}{" "}
              coupure(s)
            </div>
          </Overlay>
        )}

        <ZoomControl />
      </Map>

      {locationError && !userLocation && (
        <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-xs bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-10">
          <p className="font-bold">Localisation requise</p>
          <p className="text-sm mt-1">{locationError}</p>
          {locationError.includes("refusé") && (
            <button
              onClick={onRequestUserLocation}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
            >
              Réactiver la localisation
            </button>
          )}
        </div>
      )}
      {!locationPrompted && !userLocation && (
        <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-xs bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-md z-10">
          <p className="font-bold">Localisez-vous !</p>
          <p className="text-sm mt-1">
            Cliquez pour voir les coupures proches de chez vous.
          </p>
          <button
            onClick={onRequestUserLocation}
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <Target className="h-4 w-4 mr-1" /> Activer ma localisation
          </button>
        </div>
      )}

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col space-y-2">
        <button
          className="bg-card rounded-full w-10 h-10 shadow-md flex items-center justify-center text-foreground hover:bg-muted"
          onClick={onZoomIn}
          title="Zoom avant"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          className="bg-card rounded-full w-10 h-10 shadow-md flex items-center justify-center text-foreground hover:bg-muted"
          onClick={onZoomOut}
          title="Zoom arrière"
        >
          <Minus className="h-5 w-5" />
        </button>
        <button
          className="bg-card rounded-full w-10 h-10 shadow-md flex items-center justify-center text-foreground hover:bg-muted"
          onClick={onResetView}
          title="Vue d'ensemble"
        >
          <Layers className="h-5 w-5" />
        </button>
        <button
          className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center transition-colors ${
            userLocation
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-card text-foreground hover:bg-muted"
          }`}
          onClick={onCenterOnUser}
          title={
            userLocation ? "Centrer sur ma position" : "Activer la géolocalisation"
          }
        >
          <Target className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-14 right-4 bg-card p-3 rounded-lg shadow-md border border-border hidden md:block">
        <div className="text-sm font-medium mb-2">Légende</div>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-foreground">Aucune coupure</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-foreground">1-2 coupures</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-foreground">3+ coupures</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;
