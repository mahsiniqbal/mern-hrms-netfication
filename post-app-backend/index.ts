import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth";
import employeeRoutes from "./routes/employees"; // no need for .ts extension
import attendanceRoutes from "./routes/attendance";
import projectRoutes from "./routes/projects";
import projectWorkLogRoutes from "./routes/projectWorkLogs";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-work-logs", projectWorkLogRoutes);

// Global error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('Error:', err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
		statusCode: err.status || 500
	});
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hrms";
const PORT = process.env.PORT || 5000;

mongoose
	.connect(MONGODB_URI)
	.then(async () => {
		console.log("MongoDB connected");
		app.listen(PORT, () =>
			console.log(`Server running on http://localhost:${PORT}`)
		);
	})
	.catch(err => console.error("MongoDB connection error:", err));
