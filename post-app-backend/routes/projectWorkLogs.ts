import express, { Request, Response } from "express";
import ProjectWorkLog, { IProjectWorkLog } from "../models/ProjectWorkLog";
import Project from "../models/Project";

const router = express.Router();

// Get all work logs
router.get("/", async (req: Request, res: Response) => {
	try {
		const { projectId, employeeId, startDate, endDate } = req.query;

		const filter: any = {};

		if (projectId) {
			filter.projectId = parseInt(projectId as string);
		}

		if (employeeId) {
			filter.employeeId = parseInt(employeeId as string);
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

// Get single work log by ID
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const workLog = await ProjectWorkLog.findOne({
			id: parseInt(req.params.id),
		});
		if (!workLog) {
			return res.status(404).json({ message: "Work log not found" });
		}
		res.json(workLog);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Create new work log
router.post("/", async (req: Request, res: Response) => {
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

// Update work log
router.put("/:id", async (req: Request, res: Response) => {
	try {
		const oldWorkLog = await ProjectWorkLog.findOne({
			id: parseInt(req.params.id),
		});
		if (!oldWorkLog) {
			return res.status(404).json({ message: "Work log not found" });
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

// Delete work log
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const workLog = await ProjectWorkLog.findOneAndDelete({
			id: parseInt(req.params.id),
		});
		if (!workLog) {
			return res.status(404).json({ message: "Work log not found" });
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
