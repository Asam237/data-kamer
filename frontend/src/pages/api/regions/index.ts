import type { NextApiRequest, NextApiResponse } from "next";
import cameroonData from "../../../../public/data/cameroon.json";
import { Region } from "../../../../types";

interface ApiError {
  error: string;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Region[] | ApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      message: "Seule la méthode GET est autorisée pour cette route",
    });
  }

  try {
    const { regions } = cameroonData;
    res.status(200).json(regions);
  } catch (error) {
    console.error("Erreur dans /api/regions:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de récupérer les données des régions",
    });
  }
}
