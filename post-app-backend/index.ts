import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

import employeeRoutes from "./routes/employees"; // no need for .ts extension
import attendanceRoutes from "./routes/attendance";
import projectRoutes from "./routes/projects";
import projectWorkLogRoutes from "./routes/projectWorkLogs";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-work-logs", projectWorkLogRoutes);

// MongoDB Connection
mongoose
	.connect("mongodb://localhost:27017/hrms")
	.then(async () => {
		console.log("MongoDB connected");
		app.listen(5000, () =>
			console.log("Server running on http://localhost:5000")
		);
	})
	.catch(err => console.error("MongoDB connection error:", err));
