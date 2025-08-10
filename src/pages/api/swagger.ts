import { NextApiRequest, NextApiResponse } from "next";
import swaggerUi from "swagger-ui-express";
import { swaggerDefinition } from "../../../src/swagger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).end();
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(swaggerDefinition);
}
