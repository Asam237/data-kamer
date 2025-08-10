import { NextApiRequest, NextApiResponse } from "next";
import swaggerUi from "swagger-ui-express";
import { swaggerDefinition } from "../../swagger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(swaggerDefinition);
}
