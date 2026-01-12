import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Emp from "../models/Emp";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hrms";
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || "ChangeMe123!";

async function migrateAuthFields() {
	try {
		// Connect to MongoDB
		await mongoose.connect(MONGODB_URI);
		console.log("MongoDB connected");

		// Hash the default password
		const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
		console.log("Default password hashed");

		// Update all existing employees that don't have a password
		const result = await Emp.updateMany(
			{ password: { $exists: false } }, // Only update if no password exists
			{
				$set: {
					password: hashedPassword,
					isFirstLogin: true,
					role: 'user'
				}
			}
		);
		console.log(`Updated ${result.modifiedCount} employees with default password and user role`);

		// Set admin role for employee with ID 3 (Ahsin Iqbal)
		const adminResult = await Emp.updateOne(
			{ id: 3 },
			{ $set: { role: 'admin' } }
		);

		if (adminResult.modifiedCount > 0) {
			console.log('Admin role assigned to employee ID 3 (Ahsin Iqbal)');
		} else {
			console.log('Employee ID 3 not found or already has admin role');
		}

		console.log('Migration completed successfully!');
		console.log(`All users can now login with password: ${DEFAULT_PASSWORD}`);
		console.log('They will be required to change their password on first login.');

		process.exit(0);
	} catch (error) {
		console.error('Migration error:', error);
		process.exit(1);
	}
}

migrateAuthFields();
