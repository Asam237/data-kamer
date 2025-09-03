export const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API Cameroun - Statistiques et informations clés",
    version: "1.0.0",
    description:
      "Documentation Swagger de l'API qui vous permet de manipuler facilement des données sur le Cameroun.",
  },
  servers: [
    {
      url: "https://data-kamer.vercel.app",
      description: "Serveur de production",
    },
    {
      url: "http://localhost:3000",
      description: "Serveur local",
    },
  ],
  components: {
    schemas: {
      University: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Université de Yaoundé I" },
          region: { type: "string", example: "Centre" },
          founded: { type: "integer", example: 1962 },
          type: { type: "string", example: "Public" },
          students: { type: "integer", example: 45000 },
          website: { type: "string", example: "https://www.uy1.uninet.cm" },
          description: {
            type: "string",
            example: "La plus ancienne université du Cameroun...",
          },
          faculties: {
            type: "array",
            items: { type: "string" },
            example: [
              "Faculté des Sciences",
              "Faculté de Médecine et des Sciences Biomédicales",
            ],
          },
        },
        required: [
          "id",
          "name",
          "region",
          "founded",
          "type",
          "students",
          "website",
          "description",
          "faculties",
        ],
      },
      Region: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Adamaoua" },
          capital: { type: "string", example: "Ngaoundéré" },
          population: { type: "integer", example: 884289 },
          area: { type: "integer", example: 63701 },
          departments: {
            type: "array",
            items: { type: "string" },
            example: ["Djérem", "Faro-et-Déo", "Mayo-Banyo"],
          },
        },
        required: [
          "id",
          "name",
          "capital",
          "population",
          "area",
          "departments",
        ],
      },
      Overview: {
        type: "object",
        properties: {
          totalPopulation: { type: "integer", example: 27914536 },
          totalArea: { type: "integer", example: 475442 },
          totalRegions: { type: "integer", example: 10 },
          totalDepartments: { type: "integer", example: 58 },
          totalUniversities: { type: "integer", example: 16 },
          capital: { type: "string", example: "Yaoundé" },
          officialLanguages: {
            type: "array",
            items: { type: "string" },
            example: ["Français", "Anglais"],
          },
          currency: { type: "string", example: "Franc CFA" },
        },
        required: [
          "totalPopulation",
          "totalArea",
          "totalRegions",
          "totalDepartments",
          "totalUniversities",
          "capital",
          "officialLanguages",
          "currency",
        ],
      },
      ApiError: {
        type: "object",
        properties: {
          error: { type: "string", example: "Erreur interne du serveur" },
          message: {
            type: "string",
            example: "Impossible de récupérer les données",
          },
        },
      },
    },
  },
  paths: {
    "/api/universities": {
      get: {
        summary: "Liste des universités",
        description: "Retourne la liste des universités du Cameroun.",
        responses: {
          200: {
            description: "Succès - Liste des universités",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/University" },
                },
              },
            },
          },
          405: {
            description: "Méthode non autorisée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/regions": {
      get: {
        summary: "Liste des régions",
        description: "Retourne la liste des régions du Cameroun.",
        responses: {
          200: {
            description: "Succès - Liste des régions",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Region" },
                },
              },
            },
          },
          405: {
            description: "Méthode non autorisée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
    "/api/overview": {
      get: {
        summary: "Aperçu national",
        description: "Retourne les statistiques nationales du Cameroun.",
        responses: {
          200: {
            description: "Succès - Aperçu",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Overview" },
              },
            },
          },
          405: {
            description: "Méthode non autorisée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
          500: {
            description: "Erreur serveur",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
              },
            },
          },
        },
      },
    },
  },
};
