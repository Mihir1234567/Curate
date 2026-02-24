import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler";

// Routes
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(morgan("dev"));

// ── Security ─────────────────────────────────────────
app.use(helmet());

const envOrigins = process.env.CORS_ORIGIN?.split(",") || [];
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.curatehomedecor.shop",
  "https://curatehomedecor.shop",
  ...envOrigins,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or curl requests (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(
          `CORS blocked: Origin ${origin} is not in allowedOrigins:`,
          allowedOrigins,
        );
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 100 to 1000 for development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
app.use("/api/", limiter);

// ── Body Parsing ─────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.get("/", (_req, res) => {
  res.send("Server is running");
});

// ── Error Handler (must be last) ─────────────────────
app.use(errorHandler);

export default app;
