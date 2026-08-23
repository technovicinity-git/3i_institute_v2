import swaggerJsdoc from "swagger-jsdoc";
import { env } from "#/config/env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3", // Change from 3.1.0 to 3.0.3 — better swagger-ui support for file upload
    info: {
      title: "3i International Islamic Institute API",
      version: "2.0.0",
      description:
        "Phase 2 - Multi-language online learning platform API documentation",
      contact: {
        name: "3i Institute",
        email: "support@3iinstitute.edu",
      },
    },
    servers: [
      {
        url:
          env.NODE_ENV === "production"
            ? "https://api.3iinstitute.edu"
            : `http://localhost:${env.PORT}`,
        description:
          env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: { type: "object" },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            locale: { type: "string", enum: ["en", "bn", "hi", "ur", "ar"] },
            emailVerified: { type: "boolean" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
