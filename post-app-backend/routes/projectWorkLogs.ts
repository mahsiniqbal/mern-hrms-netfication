import express, { Response } from "express";
import ProjectWorkLog, { IProjectWorkLog } from "../models/ProjectWorkLog";
import Project from "../models/Project";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/authorize";

const router = express.Router();

// Get all work logs (Admin sees all, User sees only their own)
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const { projectId, employeeId, startDate, endDate } = req.query;

		const filter: any = {};

		// Data filtering based on role
		if (user?.role === 'admin') {
			// Admin can filter by any employeeId
			if (employeeId) {
				filter.employeeId = parseInt(employeeId as string);
			}
		} else {
			// Regular user can only see their own work logs
			filter.employeeId = user?.userId;
		}

		if (projectId) {
			filter.projectId = parseInt(projectId as string);
		}

		if (startDate || endDate) {
			filter.date = {};
			if (startDate) {
				filter.date.$gte = new Date(startDate as string);
			}
			if (endDate) {
				filter.date.$lte = new Date(endDate as string);
			}
		}

		const workLogs = await ProjectWorkLog.find(filter).sort({ date: -1 });
		res.json(workLogs);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Get single work log by ID (Admin can view any, User can only view their own)
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const workLog = await ProjectWorkLog.findOne({
			id: parseInt(req.params.id),
		});

		if (!workLog) {
			res.status(404).json({ message: "Work log not found" });
			return;
		}

		// Check authorization: user can only view their own work logs
		if (user?.role !== 'admin' && workLog.employeeId !== user?.userId) {
			res.status(403).json({ error: "Access denied. You can only view your own work logs." });
			return;
		}

		res.json(workLog);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Create new work log (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const workLog = new ProjectWorkLog(req.body);
		const newWorkLog = await workLog.save();

		// Update project's total hours worked
		await Project.findOneAndUpdate(
			{ id: req.body.projectId },
			{ $inc: { totalHoursWorked: req.body.hoursWorked } }
		);

		res.status(201).json(newWorkLog);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Update work log (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const oldWorkLog = await ProjectWorkLog.findOne({
			id: parseInt(req.params.id),
		});
		if (!oldWorkLog) {
			res.status(404).json({ message: "Work log not found" });
			return;
		}

		const hoursDifference = req.body.hoursWorked - oldWorkLog.hoursWorked;

		const workLog = await ProjectWorkLog.findOneAndUpdate(
			{ id: parseInt(req.params.id) },
			req.body,
			{ new: true, runValidators: true }
		);

		// Update project's total hours worked
		if (hoursDifference !== 0) {
			await Project.findOneAndUpdate(
				{ id: oldWorkLog.projectId },
				{ $inc: { totalHoursWorked: hoursDifference } }
			);
		}

		res.json(workLog);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Delete work log (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const workLog = await ProjectWorkLog.findOneAndDelete({
			id: parseInt(req.params.id),
		});
		if (!workLog) {
			res.status(404).json({ message: "Work log not found" });
			return;
		}

		// Update project's total hours worked
		await Project.findOneAndUpdate(
			{ id: workLog.projectId },
			{ $inc: { totalHoursWorked: -workLog.hoursWorked } }
		);

		res.json({ message: "Work log deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

export default router;
