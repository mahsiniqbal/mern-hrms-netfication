import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Emp from "../models/Emp";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hrms";

async function listEmails() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log("MongoDB connected");

		const employees = await Emp.find({}).select("id empName email role").sort({ id: 1 });

		console.log("\n=== Employee List ===");
		employees.forEach(emp => {
			console.log(`ID: ${emp.id} | Name: ${emp.empName} | Email: ${emp.email} | Role: ${emp.role}`);
		});
		console.log("\n===================\n");

		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

listEmails();
