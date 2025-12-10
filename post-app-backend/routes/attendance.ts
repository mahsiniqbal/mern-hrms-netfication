import express, { Request, Response } from "express";
import Attendance from "../models/Attendance";
import Emp from "../models/Emp";

const router = express.Router();

// Create a new attendance record
router.post("/", async (req: Request, res: Response) => {
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

// Get all attendance records with optional filters
router.get("/", async (req: Request, res: Response) => {
	try {
		const { employeeId, startDate, endDate, status } = req.query;
		let query: any = {};

		if (employeeId) {
			query.employeeId = Number(employeeId);
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

// Get attendance record by ID
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const attendance = await Attendance.findOne({ id: req.params.id });
		if (!attendance) return res.status(404).json({ error: "Not found" });
		res.json(attendance);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Update attendance record by ID
router.put("/:id", async (req: Request, res: Response) => {
	try {
		const updatedAttendance = await Attendance.findOneAndUpdate(
			{ id: req.params.id },
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);
		if (!updatedAttendance)
			return res.status(404).json({ error: "Not found" });
		res.json(updatedAttendance);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

// Delete attendance record by ID
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const deletedAttendance = await Attendance.findOneAndDelete({
			id: req.params.id,
		});

		if (!deletedAttendance)
			return res.status(404).json({ error: "Not found" });
		res.json({ message: "Deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get attendance statistics
router.get("/stats/summary", async (req: Request, res: Response) => {
	try {
		const { employeeId, period, year, month } = req.query;

		let matchStage: any = {};

		// Filter by employee if provided
		if (employeeId) {
			matchStage.employeeId = Number(employeeId);
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

// Get attendance trends (for charts)
router.get("/stats/trends", async (req: Request, res: Response) => {
	try {
		const { employeeId, period, year, month } = req.query;

		let matchStage: any = {};

		if (employeeId) {
			matchStage.employeeId = Number(employeeId);
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
