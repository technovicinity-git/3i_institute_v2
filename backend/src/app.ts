import type { Express } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import { env } from "#/config/env";
import { swaggerSpec } from "#/config/swagger";
import { mountRoutes } from "#/routes";
import { stripeWebhookRoutes } from "#/modules/billing/webhook-routes";
import { errorHandler } from "#/middleware/error-handler";
import { notFoundHandler } from "#/middleware/not-found";

const app: Express = express();

// Stripe webhook MUST be before express.json() for raw body
app.use("/webhooks", stripeWebhookRoutes);

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Compression
app.use(compression());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Swagger documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

// Routes
mountRoutes(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
