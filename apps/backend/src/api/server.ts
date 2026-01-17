import express, { Application } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import dotenv from "dotenv";

// Routes
import postsRoutes from "./routes/posts";
import tagsRoutes from "./routes/tags";
import statsRoutes from "./routes/stats";

// Middleware
import { errorHandler } from "./middleware/error-handler";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Load Swagger spec
const swaggerDocument = YAML.load(
  path.join(__dirname, "swagger", "openapi.yaml")
);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "DevDose API Documentation",
  customCss: ".swagger-ui .topbar { display: none }",
}));

// Routes
app.use("/api/posts", postsRoutes);
app.use("/api", tagsRoutes);
app.use("/api", statsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "DevDose API",
    version: "1.0.0",
    description: "REST API for DevDose micro-learning platform",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DevDose API server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
