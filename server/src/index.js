const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const { authLimiter } = require("./security/rateLimiter");
const { sanitizeInput, sanitizeMongo } = require("./security/inputSanitizer");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const participationRoutes = require("./routes/participationRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        console.warn(
          `Origin ${origin} not allowed by CORS. Allowed origins: ${allowedOrigins.join(
            ", "
          )}`
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(xss());
app.use(morgan("dev"));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Rate limiting
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);
*/

// Health check endpoint for API root
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Volunteer Management System API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      events: "/api/events",
      participations: "/api/participations",
      ngos: "/api/ngos",
      registrations: "/api/registrations",
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participations", participationRoutes);
app.use("/api/ngos", ngoRoutes);
app.use("/api/registrations", registrationRoutes);

// 404 Route
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
