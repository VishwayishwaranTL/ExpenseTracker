import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import incomeRoutes from "./routes/IncomeRoutes.js";
import expenseRoutes from "./routes/ExpenseRoutes.js";
import dashboardRoutes from "./routes/DashboardRoutes.js";

// Initialize environment variables
dotenv.config();

// Convert ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS for frontend on Vercel
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://expense-tracker-zeta-weld-89.vercel.app",
    credentials: true,
  })
);

// Middleware for parsing JSON
app.use(express.json());

// 🔐 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// 📁 Serve uploaded files & ensure folder exists
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
app.use("/uploads", express.static(uploadPath));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port: ${PORT}`);
});
