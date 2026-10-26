import type { NextApiRequest, NextApiResponse } from "next";
import { getDataset } from "@/lib/dataset";
import { ExtendedOverview } from "../../../types";

interface ApiError {
  error: string;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedOverview | ApiError>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      message: "Seule la méthode GET est autorisée pour cette route",
    });
  }

  try {
    // Même source que l'interface (data/cameroon.json)
    const { overview, universities } = getDataset();

    // Calculer les statistiques étendues
    const totalStudents = universities.reduce(
      (acc, uni) => acc + (uni.students || 0),
      0
    );
    const currentYear = new Date().getFullYear();
    const averageUniversityAge =
      universities.length > 0
        ? Math.round(
            currentYear -
              universities.reduce((sum, uni) => sum + uni.founded, 0) /
                universities.length
          )
        : 0;

    const stats: ExtendedOverview = {
      ...overview,
      totalUniversities: universities.length,
      totalStudents,
      averageUniversityAge,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erreur dans /api/overview:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Une erreur est survenue lors du traitement de votre demande",
    });
  }
}
