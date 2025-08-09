import type { NextApiRequest, NextApiResponse } from "next";
import { cameroonData } from "../../../../data/cameroon";
import { University } from "../../../../types";

interface ApiError {
  error: string;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<University[] | ApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      message: "Seule la méthode GET est autorisée pour cette route",
    });
  }

  try {
    const { universities } = cameroonData;
    res.status(200).json(universities);
  } catch (error) {
    console.error("Erreur dans /api/universities:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de récupérer les données des universités",
    });
  }
}
