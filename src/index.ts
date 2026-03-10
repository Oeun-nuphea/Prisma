import express, { Application } from "express";
import user from "./routes/user.routes";
import note from "./routes/note.routes";
import admin from "./routes/admin.routes";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import rateLimit from "express-rate-limit";

dotenv.config();

const app: Application = express();
app.set("trust proxy", 1); // trust first proxy so req.ip and X-Forwarded-For work correctly

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100, // max 100 requests per window
  message: { message: "Too many requests, please try again later." },
});

app.use(limiter);

const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false })); // disable CSP so Swagger UI loads

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
  },
  apis: ["./src/routes/*.ts"],
});

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/users", user);
app.use("/notes", note);
app.use("/admin", admin);

app.get("/", (_req, res) => res.json({ message: "Note is running" }));

app.listen(Number(PORT), "0.0.0.0", () =>
  console.log(
    `Server running at http://localhost:${PORT}\nSwagger docs: http://localhost:${PORT}/docs`,
  ),
);
