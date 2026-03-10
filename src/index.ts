import express, { Application } from "express";
import user from "./routes/user.routes";
import note from "./routes/note.routes";
import admin from "./routes/admin.routes";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import rateLimit from "express-rate-limit";

dotenv.config();

const app: Application = express();
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  message: { message: "Too many requests, please try again later." },
});

app.use(limiter);

const PORT = process.env.PORT || 4000;
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));

// ─── Swagger Setup ────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Note API",
      version: "1.0.0",
      description: "REST API for Note app with User and Admin management",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
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

// Encoded as a data URI — no static file or customHtml needed
const swaggerAutofillScript = Buffer.from(`
(function () {
  const _fetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await _fetch.apply(this, args);
    const clone = response.clone();

    try {
      const body = await clone.json();
      if (body?.accessToken) {
        // Poll until swagger UI is ready, then authorize
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
`).toString("base64");

app.use(express.json());
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: "Note API Docs",
    customJs: `data:text/javascript;base64,${swaggerAutofillScript}`,
  }),
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/users", user);
app.use("/notes", note);
app.use("/admin", admin);

app.get("/", (_req, res) => res.json({ message: "Note is running" }));

app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(
    `Server running at http://localhost:${PORT}\nSwagger docs: http://localhost:${PORT}/api-docs`,
  ),
);