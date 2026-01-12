import express, { Response } from "express";
import Project, { IProject } from "../models/Project";
import ProjectWorkLog from "../models/ProjectWorkLog";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/authorize";

const router = express.Router();

// Get all projects (Both admin and users can view all projects)
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const projects = await Project.find().sort({ createdAt: -1 });
		res.json(projects);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Get single project by ID (Both admin and users can view)
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const project = await Project.findOne({ id: parseInt(req.params.id) });
		if (!project) {
			res.status(404).json({ message: "Project not found" });
			return;
		}
		res.json(project);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Create new project (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const project = new Project(req.body);
		const newProject = await project.save();
		res.status(201).json(newProject);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Update project (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const project = await Project.findOneAndUpdate(
			{ id: parseInt(req.params.id) },
			req.body,
			{ new: true, runValidators: true }
		);
		if (!project) {
			res.status(404).json({ message: "Project not found" });
			return;
		}
		res.json(project);
	} catch (error: any) {
		res.status(400).json({ message: error.message });
	}
});

// Delete project (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const project = await Project.findOneAndDelete({
			id: parseInt(req.params.id),
		});
		if (!project) {
			res.status(404).json({ message: "Project not found" });
			return;
		}
		// Also delete all work logs for this project
		await ProjectWorkLog.deleteMany({ projectId: parseInt(req.params.id) });
		res.json({ message: "Project deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Get project statistics (Admin sees all, User sees filtered by their work logs)
router.get("/stats/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const { projectId, year, month } = req.query;

		const matchStage: any = {};

		if (projectId && projectId !== "all") {
			matchStage.projectId = parseInt(projectId as string);
		}

		// Build date filter for work logs
		const workLogMatch: any = {};
		if (year) {
			workLogMatch.date = {
				$gte: new Date(parseInt(year as string), 0, 1),
				$lt: new Date(parseInt(year as string) + 1, 0, 1),
			};
			if (month) {
				workLogMatch.date = {
					$gte: new Date(
						parseInt(year as string),
						parseInt(month as string) - 1,
						1
					),
					$lt: new Date(
						parseInt(year as string),
						parseInt(month as string),
						1
					),
				};
			}
		}

		// Get project stats
		const stats = await Project.aggregate([
			{ $match: matchStage },
			{
				$lookup: {
					from: "projectworklogs",
					let: { projectId: "$id" },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ["$projectId", "$$projectId"] },
								...workLogMatch,
							},
						},
						{
							$group: {
								_id: null,
								totalHours: { $sum: "$hoursWorked" },
							},
						},
					],
					as: "workLogs",
				},
			},
			{
				$project: {
					_id: "$id",
					projectName: 1,
					projectCode: 1,
					status: 1,
					priority: 1,
					progress: 1,
					budget: 1,
					totalHoursAllocated: 1,
					totalHoursWorked: {
						$ifNull: [{ $arrayElemAt: ["$workLogs.totalHours", 0] }, 0],
					},
					startDate: 1,
					endDate: 1,
				},
			},
		]);

		res.json(stats);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Get project work hours trends (Admin sees all, User sees filtered by their work logs)
router.get("/stats/trends", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const { projectId, period = "month", year, month } = req.query;

		const currentDate = new Date();
		const currentYear = year ? parseInt(year as string) : currentDate.getFullYear();
		const currentMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;

		const matchStage: any = {};

		if (projectId && projectId !== "all") {
			matchStage.projectId = parseInt(projectId as string);
		}

		let startDate: Date;
		let groupBy: any;

		if (period === "year") {
			startDate = new Date(currentYear, 0, 1);
			matchStage.date = {
				$gte: startDate,
				$lt: new Date(currentYear + 1, 0, 1),
			};
			groupBy = { $month: "$date" };
		} else if (period === "month") {
			startDate = new Date(currentYear, currentMonth - 1, 1);
			matchStage.date = {
				$gte: startDate,
				$lt: new Date(currentYear, currentMonth, 1),
			};
			groupBy = { $dayOfMonth: "$date" };
		} else {
			// week
			const today = new Date(currentYear, currentMonth - 1, currentDate.getDate());
			const firstDay = new Date(today);
			firstDay.setDate(today.getDate() - today.getDay());
			startDate = firstDay;
			matchStage.date = {
				$gte: startDate,
				$lt: new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000),
			};
			groupBy = { $dayOfWeek: "$date" };
		}

		const trends = await ProjectWorkLog.aggregate([
			{ $match: matchStage },
			{
				$group: {
					_id: groupBy,
					totalHours: { $sum: "$hoursWorked" },
					logCount: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.json(trends);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

// Get employee work rate by project (Admin sees all, User sees filtered by their work logs)
router.get("/stats/employee-work-rate", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const { projectId, year, month } = req.query;

		const matchStage: any = {};

		if (projectId && projectId !== "all") {
			matchStage.projectId = parseInt(projectId as string);
		}

		if (year) {
			matchStage.date = {
				$gte: new Date(parseInt(year as string), 0, 1),
				$lt: new Date(parseInt(year as string) + 1, 0, 1),
			};
			if (month) {
				matchStage.date = {
					$gte: new Date(
						parseInt(year as string),
						parseInt(month as string) - 1,
						1
					),
					$lt: new Date(
						parseInt(year as string),
						parseInt(month as string),
						1
					),
				};
			}
		}

		const employeeStats = await ProjectWorkLog.aggregate([
			{ $match: matchStage },
			{
				$group: {
					_id: "$employeeId",
					employeeName: { $first: "$employeeName" },
					totalHours: { $sum: "$hoursWorked" },
					logCount: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 1,
					employeeName: 1,
					totalHours: 1,
					logCount: 1,
				},
			},
			{ $sort: { totalHours: -1 } },
		]);

		// Calculate total hours for percentage
		const totalHours = employeeStats.reduce(
			(sum, emp) => sum + emp.totalHours,
			0
		);

		// Add work rate percentage
		const statsWithRate = employeeStats.map(emp => ({
			...emp,
			workRatePercentage:
				totalHours > 0 ? ((emp.totalHours / totalHours) * 100).toFixed(2) : 0,
		}));

		res.json(statsWithRate);
	} catch (error: any) {
		res.status(500).json({ message: error.message });
	}
});

export default router;
