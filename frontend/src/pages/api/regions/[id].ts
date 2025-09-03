import type { NextApiRequest, NextApiResponse } from "next";
import cameroonData from "../../../../public/data/cameroon.json";
import { Region } from "../../../../types";

interface ApiError {
  error: string;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Region | ApiError>
) {
  const { id } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      message: "Seule la méthode GET est autorisée pour cette route",
    });
  }

  try {
    // Validation de l'ID
    const regionId = parseInt(id as string, 10);
    if (isNaN(regionId)) {
      return res.status(400).json({
        error: "ID invalide",
        message: "L'ID de la région doit être un nombre valide",
      });
    }

    const region = cameroonData.regions.find((r) => r.id === regionId);

    if (!region) {
      return res.status(404).json({
        error: "Région non trouvée",
        message: `Aucune région trouvée avec l'ID ${regionId}`,
      });
    }

    res.status(200).json(region);
  } catch (error) {
    console.error("Erreur dans /api/regions/[id]:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de récupérer les données de la région",
    });
  }
}
