import express, { Response } from "express";
import bcrypt from "bcryptjs";
import Emp from "../models/Emp";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/authorize";

const router = express.Router();
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD || "ChangeMe123!";

// Create a new employee (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		// Hash the default password
		const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

		// Create employee with default password and user role
		const employeeData = {
			...req.body,
			password: hashedPassword,
			isFirstLogin: true,
			role: req.body.role || 'user', // Default to 'user' unless specified
		};

		const newEmp = new Emp(employeeData);
		const savedEmp = await newEmp.save();

		// Don't return password in response
		const { password, ...response } = savedEmp.toObject();

		res.status(201).json(response);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

// Get all employees (Admin sees all, User sees only their own)
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;

		// Admin can see all employees, regular user can only see their own
		const filter = user?.role === 'admin' ? {} : { id: user?.userId };

		const employees = await Emp.find(filter);
		res.json(employees);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get employee by ID (Admin can view any, User can only view their own)
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const requestedId = parseInt(req.params.id);

		// Check authorization: user can only view their own record
		if (user?.role !== 'admin' && user?.userId !== requestedId) {
			res.status(403).json({ error: "Access denied. You can only view your own record." });
			return;
		}

		const employee = await Emp.findOne({ id: requestedId });
		if (!employee) {
			res.status(404).json({ error: "Employee not found" });
			return;
		}

		res.json(employee);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Update employee by ID (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		// Prevent updating password through this endpoint (use change-password instead)
		const { password, ...updateData } = req.body;

		const updatedEmp = await Emp.findOneAndUpdate(
			{ id: req.params.id },
			updateData,
			{
				new: true,
			}
		);

		if (!updatedEmp) {
			res.status(404).json({ error: "Employee not found" });
			return;
		}

		res.json(updatedEmp);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

// Delete employee by ID (Admin only, cannot delete self)
router.delete("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const targetId = parseInt(req.params.id);

		// Prevent admin from deleting themselves
		if (user?.userId === targetId) {
			res.status(403).json({ error: "You cannot delete your own account." });
			return;
		}

		const deletedEmp = await Emp.findOneAndDelete({ id: targetId });

		if (!deletedEmp) {
			res.status(404).json({ error: "Employee not found" });
			return;
		}

		res.json({ message: "Employee deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
