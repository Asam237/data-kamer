import { NextApiRequest, NextApiResponse } from "next";
import swaggerUi from "swagger-ui-express";
import { swaggerDefinition } from "../../../src/swagger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(swaggerDefinition);
}
