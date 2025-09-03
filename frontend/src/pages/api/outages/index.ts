import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

interface OutageInfo {
  observations: string;
  prog_date: string;
  prog_heure_debut: string;
  prog_heure_fin: string;
  quartier: string;
  region: string;
  ville: string;
}

interface OutageResponse {
  status: number;
  data: OutageInfo[];
}

interface RegionOutage {
  regionCode: string;
  regionName: string;
  outages: OutageResponse;
  error?: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

const REGION_MAPPING: Record<string, string> = {
  "2": "CENTRE",
  "5": "LITTORAL",
  "6": "OUEST",
  "10": "SUD-OUEST",
  "8": "NORD-OUEST",
  "9": "SUD",
  "3": "EST",
  "1": "ADAMAOUA",
  "7": "NORD",
  "4": "EXTRÊME-NORD",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegionOutage | RegionOutage[] | ErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const regionCode = req.query.regionCode as string;

  if (regionCode && REGION_MAPPING[regionCode]) {
    try {
      const response = await axios({
        method: "POST",
        url: "https://alert.eneo.cm/ajaxOutage.php",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://alert.eneo.cm/",
          Origin: "https://alert.eneo.cm",
        },
        data: {
          region: regionCode,
        },
      });

      const normalizedOutages = normalizeOutageData(response.data);

      return res.status(200).json({
        regionCode,
        regionName: REGION_MAPPING[regionCode],
        outages: normalizedOutages,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      return res.status(500).json({
        message: `Erreur lors de la récupération des coupures pour la région ${regionCode}`,
        error: axiosError.message,
      });
    }
  }

  try {
    const regionCodes = Object.keys(REGION_MAPPING);
    const outagePromises = regionCodes.map(async (code) => {
      try {
        const response = await axios({
          method: "POST",
          url: "https://alert.eneo.cm/ajaxOutage.php",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: "https://alert.eneo.cm/",
            Origin: "https://alert.eneo.cm",
          },
          data: {
            region: code,
          },
        });

        const normalizedOutages = normalizeOutageData(response.data);
        return {
          regionCode: code,
          regionName: REGION_MAPPING[code],
          outages: normalizedOutages,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Erreur pour la région ${code}:`, axiosError.message);
        return {
          regionCode: code,
          regionName: REGION_MAPPING[code],
          outages: { status: 1, data: [] },
          error: axiosError.message,
        };
      }
    });

    const results = await Promise.all(outagePromises);
    res.status(200).json(results);
  } catch (error) {
    const axiosError = error as AxiosError;
    res.status(500).json({
      message: "Erreur lors de la récupération des coupures",
      error: axiosError.message,
    });
  }
}

function normalizeOutageData(data: any): OutageResponse {
  if (data && typeof data === "object" && "status" in data && "data" in data) {
    return data as OutageResponse;
  }

  if (Array.isArray(data)) {
    return {
      status: 1,
      data: data,
    };
  }

  return {
    status: 1,
    data: [],
  };
}
