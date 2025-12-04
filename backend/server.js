const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const path = require("path");
const fs = require("fs");

const primaryEnvPath = path.join(__dirname, ".env.developement");
const fallbackEnvPath = path.join(__dirname, ".env");

if (fs.existsSync(primaryEnvPath)) {
  dotenv.config({ path: primaryEnvPath });
} else if (fs.existsSync(fallbackEnvPath)) {
  dotenv.config({ path: fallbackEnvPath });
} else {
  dotenv.config();
  console.warn(
    "⚠️  No backend/.env.developement or backend/.env file found. Relying on existing environment variables."
  );
}
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts, please try again later.",
});

// Routes
app.use("/api/auth", authLimiter, require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes")); // Protected routes
app.use("/api/profile", require("./src/routes/profileRoutes"));
app.use("/api/jobs", require("./src/routes/jobRoutes"));
app.use("/api/internships", require("./src/routes/internshipRoutes"));
app.use("/api/projects", require("./src/routes/projectRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/student", require("./src/routes/studentRoutes"));
app.use("/api/comments", require("./src/routes/commentRoutes"));
app.use("/api/professional-history", require("./src/routes/professionalHistoryRoutes"));
app.use("/api/applications", require("./src/routes/applicationRoutes"));
app.use("/api/opportunities", require("./src/routes/opportunityRoutes"));
app.use("/api/forum", require("./src/routes/forumRoutes"));
app.use("/api/professional-history", require("./src/routes/professionalHistoryRoutes"));
app.use("/api/academia", require("./src/routes/academiaRoutes"));
app.use("/api/industry", require("./src/routes/industryRoutes"));
app.use("/api/stats", require("./src/routes/statsRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/chatbot", require("./src/routes/chatbotRoutes"));
app.use("/api/recommendations", require("./src/routes/recommendationRoutes"));
app.use("/api/suggestions", require("./src/routes/suggestionRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
