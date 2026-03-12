import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import morgan from "morgan";
import promBundle from "express-prom-bundle";
import xss from 'xss-clean';



import user from "./routes/user.routes";
import note from "./routes/note.routes";
import admin from "./routes/admin.routes";

// ─── Config ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "http://localhost",
  "https://unclaimed-penni-noncalcareous.ngrok-free.dev",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

// ─── App ──────────────────────────────────────────────────────────────────────
const app: Application = express();
app.set("trust proxy", 1);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 1000,
    message: { message: "Too many requests, please try again later." },
  }),
);
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);app.use(express.json({limit: "5mb"}));

// ─── XSS Protection Middleware ────────────────────────────────────────────────
app.use(xss());

// ─── Morgan Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  // 'dev' format is concise & color-coded for development
  app.use(morgan("dev"));
} else {
  // 'combined' format is better for production logs
  app.use(morgan("combined"));
}


// ─── Monitoring / Metrics ─────────────────────────────────────────────────────
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  normalizePath: (req) => req.path.replace(/\/+$/, ''),
  metricsPath: "/metrics",
  promClient: { collectDefaultMetrics: {} },
});

app.use(metricsMiddleware);

// ─── Swagger ──────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Note API",
      version: "1.0.0",
      description: "REST API for Note app with User and Admin management",
    },
    servers: [
      { url: "http://localhost", description: "Local (via Nginx)" }, // 👈 primary
      { url: `http://localhost:${PORT}`, description: "Direct (dev only)" },
      {
        url: "https://unclaimed-penni-noncalcareous.ngrok-free.dev",
        description: "Ngrok",
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
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
});

const swaggerAutofillScript = Buffer.from(
  `
(function () {
  const _fetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await _fetch.apply(this, args);
    const clone = response.clone();
    try {
      const body = await clone.json();
      if (body?.accessToken) {
        (function authorize() {
          if (window.ui) {
            window.ui.preauthorizeApiKey("bearerAuth", body.accessToken);
          } else {
            setTimeout(authorize, 200);
          }
        })();
      }
    } catch (_) {}
    return response;
  };
})();
`,
).toString("base64");

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: "Note API Docs",
    customJs: `data:text/javascript;base64,${swaggerAutofillScript}`,
  }),
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/users", user);
app.use("/notes", note);
app.use("/admin", admin);


// ─── Global Error Handler (MUST be last) ──────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large. Maximum size is 1mb." });
  }
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";
  return res.status(status).json({ message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(
    `Server running at http://localhost:${PORT}\nSwagger docs: http://localhost/api-docs`,
  ),
);
