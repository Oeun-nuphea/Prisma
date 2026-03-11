import dotenv from "dotenv";
dotenv.config();

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

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
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

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

app.get("/", (_req, res) => res.json({ message: "Note is running" }));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(
    `Server running at http://localhost:${PORT}\nSwagger docs: http://localhost:${PORT}/api-docs`,
  ),
);
