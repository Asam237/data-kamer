import { useState, useEffect } from "react";
import Head from "next/head";
import Dashboard from "../components/Dashboard";
import RegionsView from "../components/RegionsView";
import UniversitiesView from "../components/UniversitiesView";
import { ExtendedOverview } from "../../types";
import Sidebar from "@/components/SideBar";

type ViewType = "dashboard" | "regions" | "universities" | "stats" | "settings";

export default function Home(): JSX.Element {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [overviewData, setOverviewData] = useState<ExtendedOverview | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/overview");

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: ExtendedOverview = await response.json();
      setOverviewData(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      console.error("Erreur lors du chargement des données:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (): JSX.Element => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard data={overviewData} />;
      case "regions":
        return <RegionsView />;
      case "universities":
        return <UniversitiesView />;
      case "stats":
        return <div className="p-8">Statistiques à venir...</div>;
      case "settings":
        return <div className="p-8">Paramètres à venir...</div>;
      default:
        return <Dashboard data={overviewData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOverviewData}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>CameroonAPI - Données du Cameroun</title>
        <meta
          name="description"
          content="API et interface pour les données du Cameroun"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 ml-64">
          <div className="p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">CameroonAPI</h1>
              <p className="text-gray-600 mt-2">
                Interface moderne pour explorer les données du Cameroun
              </p>
            </header>
            {renderContent()}
          </div>
        </main>
      </div>
    </>
  );
}
