import type { NextApiRequest, NextApiResponse } from "next";
import { cameroonData } from "../../../data/cameroon";
import { ExtendedOverview } from "../../../types";

interface ApiError {
  error: string;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedOverview | ApiError>
) {
  // Vérifier la méthode HTTP
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
      message: "Seule la méthode GET est autorisée pour cette route",
    });
  }

  try {
    const { overview, regions, universities } = cameroonData;

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
      totalCommunes: regions.reduce(
        (acc, region) => acc + region.departments.length * 3,
        0
      ), // Estimation
      totalVillages: regions.reduce(
        (acc, region) => acc + region.departments.length * 50,
        0
      ), // Estimation
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
