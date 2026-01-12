import express, { Response } from "express";
import Attendance from "../models/Attendance";
import Emp from "../models/Emp";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { requireAdmin } from "../middleware/authorize";

const router = express.Router();

// Create a new attendance record (Admin only)
router.post("/", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const newAttendance = new Attendance(req.body);
		const savedAttendance = await newAttendance.save();
		res.status(201).json(savedAttendance);
	} catch (error: any) {
		if (error.code === 11000) {
			res.status(400).json({
				error: "Attendance record already exists for this employee on this date",
			});
		} else {
			res.status(400).json({ error: error.message });
		}
	}
});

// Get all attendance records with optional filters (Admin sees all, User sees only their own)
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const { employeeId, startDate, endDate, status } = req.query;
		let query: any = {};

		// Data filtering based on role
		if (user?.role === 'admin') {
			// Admin can filter by any employeeId
			if (employeeId) {
				query.employeeId = Number(employeeId);
			}
		} else {
			// Regular user can only see their own records
			query.employeeId = user?.userId;
		}

		if (startDate || endDate) {
			query.date = {};
			if (startDate) {
				query.date.$gte = new Date(startDate as string);
			}
			if (endDate) {
				query.date.$lte = new Date(endDate as string);
			}
		}

		if (status) {
			query.status = status;
		}

		const attendanceRecords = await Attendance.find(query).sort({ date: -1 });
		res.json(attendanceRecords);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get attendance record by ID (Admin can view any, User can only view their own)
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const attendance = await Attendance.findOne({ id: req.params.id });

		if (!attendance) {
			res.status(404).json({ error: "Attendance record not found" });
			return;
		}

		// Check authorization: user can only view their own records
		if (user?.role !== 'admin' && attendance.employeeId !== user?.userId) {
			res.status(403).json({ error: "Access denied. You can only view your own records." });
			return;
		}

		res.json(attendance);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Update attendance record by ID (Admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const updatedAttendance = await Attendance.findOneAndUpdate(
			{ id: req.params.id },
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		if (!updatedAttendance) {
			res.status(404).json({ error: "Attendance record not found" });
			return;
		}

		res.json(updatedAttendance);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

// Delete attendance record by ID (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
	try {
		const deletedAttendance = await Attendance.findOneAndDelete({
			id: req.params.id,
		});

		if (!deletedAttendance) {
			res.status(404).json({ error: "Attendance record not found" });
			return;
		}

		res.json({ message: "Attendance record deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get attendance statistics (Admin sees all, User sees only their own stats)
router.get("/stats/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const { employeeId, period, year, month } = req.query;

		let matchStage: any = {};

		// Data filtering based on role
		if (user?.role === 'admin') {
			// Admin can filter by any employeeId
			if (employeeId) {
				matchStage.employeeId = Number(employeeId);
			}
		} else {
			// Regular user can only see their own stats
			matchStage.employeeId = user?.userId;
		}

		// Filter by period
		const currentDate = new Date();
		const currentYear = year ? Number(year) : currentDate.getFullYear();
		const currentMonth = month ? Number(month) - 1 : currentDate.getMonth();

		if (period === "week") {
			const startOfWeek = new Date(currentDate);
			startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
			startOfWeek.setHours(0, 0, 0, 0);

			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);
			endOfWeek.setHours(23, 59, 59, 999);

			matchStage.date = { $gte: startOfWeek, $lte: endOfWeek };
		} else if (period === "month") {
			const startOfMonth = new Date(currentYear, currentMonth, 1);
			const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
			endOfMonth.setHours(23, 59, 59, 999);

			matchStage.date = { $gte: startOfMonth, $lte: endOfMonth };
		} else if (period === "year") {
			const startOfYear = new Date(currentYear, 0, 1);
			const endOfYear = new Date(currentYear, 11, 31);
			endOfYear.setHours(23, 59, 59, 999);

			matchStage.date = { $gte: startOfYear, $lte: endOfYear };
		}

		const stats = await Attendance.aggregate([
			{ $match: matchStage },
			{
				$group: {
					_id: employeeId ? "$employeeId" : "$employeeId",
					employeeName: { $first: "$employeeName" },
					totalDays: { $sum: 1 },
					presentDays: {
						$sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
					},
					absentDays: {
						$sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
					},
					halfDays: {
						$sum: { $cond: [{ $eq: ["$status", "Half-Day"] }, 1, 0] },
					},
					leaveDays: {
						$sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] },
					},
					totalWorkHours: { $sum: "$workHours" },
				},
			},
			{
				$project: {
					_id: 1,
					employeeName: 1,
					totalDays: 1,
					presentDays: 1,
					absentDays: 1,
					halfDays: 1,
					leaveDays: 1,
					totalWorkHours: 1,
					attendancePercentage: {
						$multiply: [
							{
								$divide: [
									"$presentDays",
									{
										$cond: [
											{ $eq: ["$totalDays", 0] },
											1,
											"$totalDays",
										],
									},
								],
							},
							100,
						],
					},
				},
			},
			{ $sort: { attendancePercentage: -1 } },
		]);

		res.json(stats);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get attendance trends (for charts) (Admin sees all, User sees only their own trends)
router.get("/stats/trends", authenticateToken, async (req: AuthRequest, res: Response) => {
	try {
		const user = req.user;
		const { employeeId, period, year, month } = req.query;

		let matchStage: any = {};

		// Data filtering based on role
		if (user?.role === 'admin') {
			// Admin can filter by any employeeId
			if (employeeId) {
				matchStage.employeeId = Number(employeeId);
			}
		} else {
			// Regular user can only see their own trends
			matchStage.employeeId = user?.userId;
		}

		const currentDate = new Date();
		const currentYear = year ? Number(year) : currentDate.getFullYear();
		const currentMonth = month ? Number(month) - 1 : currentDate.getMonth();

		if (period === "week") {
			const startOfWeek = new Date(currentDate);
			startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
			startOfWeek.setHours(0, 0, 0, 0);

			const endOfWeek = new Date(startOfWeek);
			endOfWeek.setDate(startOfWeek.getDate() + 6);
			endOfWeek.setHours(23, 59, 59, 999);

			matchStage.date = { $gte: startOfWeek, $lte: endOfWeek };
		} else if (period === "month") {
			const startOfMonth = new Date(currentYear, currentMonth, 1);
			const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
			endOfMonth.setHours(23, 59, 59, 999);

			matchStage.date = { $gte: startOfMonth, $lte: endOfMonth };
		} else if (period === "year") {
			const startOfYear = new Date(currentYear, 0, 1);
			const endOfYear = new Date(currentYear, 11, 31);
			endOfYear.setHours(23, 59, 59, 999);

			matchStage.date = { $gte: startOfYear, $lte: endOfYear };
		}

		let groupBy: any = {};
		if (period === "year") {
			groupBy = { $month: "$date" };
		} else if (period === "month") {
			groupBy = { $dayOfMonth: "$date" };
		} else {
			groupBy = { $dayOfWeek: "$date" };
		}

		const trends = await Attendance.aggregate([
			{ $match: matchStage },
			{
				$group: {
					_id: groupBy,
					present: {
						$sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
					},
					absent: {
						$sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
					},
					halfDay: {
						$sum: { $cond: [{ $eq: ["$status", "Half-Day"] }, 1, 0] },
					},
					leave: {
						$sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] },
					},
					late: {
						$sum: { $cond: [{ $eq: ["$isLate", true] }, 1, 0] },
					},
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.json(trends);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
