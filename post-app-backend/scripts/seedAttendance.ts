import mongoose from "mongoose";
import Attendance from "../models/Attendance";
import Emp from "../models/Emp";

// Helper function to generate random status
const getRandomStatus = (): "Present" | "Absent" | "Half-Day" | "Leave" | "Holiday" => {
	const statuses: ("Present" | "Absent" | "Half-Day" | "Leave" | "Holiday")[] = [
		"Present",
		"Present",
		"Present",
		"Present",
		"Present",
		"Present",
		"Present",
		"Absent",
		"Half-Day",
		"Leave",
	];
	return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to generate random check-in time
const getRandomCheckInTime = (): string => {
	const hours = 8 + Math.floor(Math.random() * 3); // 8-10 AM
	const minutes = Math.floor(Math.random() * 60);
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

// Helper function to generate random check-out time
const getRandomCheckOutTime = (): string => {
	const hours = 17 + Math.floor(Math.random() * 3); // 5-7 PM
	const minutes = Math.floor(Math.random() * 60);
	return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

// Helper function to calculate work hours
const calculateWorkHours = (checkIn: string, checkOut: string): number => {
	const [inHour, inMin] = checkIn.split(":").map(Number);
	const [outHour, outMin] = checkOut.split(":").map(Number);

	const inMinutes = inHour * 60 + inMin;
	const outMinutes = outHour * 60 + outMin;

	return Math.round(((outMinutes - inMinutes) / 60) * 10) / 10;
};

const seedAttendance = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect("mongodb://localhost:27017/hrms");
		console.log("MongoDB connected");

		// Clear existing attendance data
		await Attendance.deleteMany({});
		console.log("Cleared existing attendance data");

		// Get all employees
		const employees = await Emp.find();
		if (employees.length === 0) {
			console.log("No employees found. Please add employees first.");
			process.exit(1);
		}

		console.log(`Found ${employees.length} employees`);

		const attendanceRecords = [];
		const today = new Date();
		const currentYear = today.getFullYear();

		// Generate attendance for the entire year (January 1 to current date)
		const startDate = new Date(currentYear, 0, 1); // January 1st of current year

		// For each employee
		for (const employee of employees) {
			// Generate attendance for all months in the year
			for (let month = 0; month < 12; month++) {
				const daysInMonth = new Date(currentYear, month + 1, 0).getDate();

				// Generate attendance for each day of the month
				for (let day = 1; day <= daysInMonth; day++) {
					const date = new Date(currentYear, month, day);

					// Skip dates before January 1st
					if (date < startDate) continue;

					// Skip future dates
					if (date > today) continue;

					// Skip weekends (optional - remove if you want weekend data)
					const dayOfWeek = date.getDay();
					if (dayOfWeek === 0 || dayOfWeek === 6) continue;

					const status = getRandomStatus();
					let checkInTime: string | undefined;
					let checkOutTime: string | undefined;
					let workHours: number | undefined;
					let isLate = false;

					// Set check-in/out times only for Present and Half-Day
					if (status === "Present" || status === "Half-Day") {
						checkInTime = getRandomCheckInTime();
						checkOutTime = getRandomCheckOutTime();
						workHours = calculateWorkHours(checkInTime, checkOutTime);

						// Check if late (after 10:00 AM)
						const [hour] = checkInTime.split(":").map(Number);
						isLate = hour >= 10;

						if (status === "Half-Day") {
							workHours = workHours / 2;
						}
					}

					attendanceRecords.push({
						employeeId: employee.id,
						employeeName: employee.empName,
						date: date,
						status: status,
						checkInTime: checkInTime,
						checkOutTime: checkOutTime,
						workHours: workHours,
						isLate: isLate,
						notes:
							status === "Leave"
								? "Planned leave"
								: status === "Absent"
								? "Unplanned absence"
								: isLate
								? "Late arrival"
								: undefined,
					});
				}
			}
		}

		console.log(
			`\n📅 Generating attendance data from ${startDate.toLocaleDateString()} to ${today.toLocaleDateString()}`
		);

		// Insert all attendance records
		console.log(`Inserting ${attendanceRecords.length} attendance records...`);
		const insertedRecords = await Attendance.insertMany(attendanceRecords);
		console.log(
			`✅ Successfully inserted ${insertedRecords.length} attendance records`
		);

		// Show summary
		const stats = await Attendance.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		const lateCount = await Attendance.countDocuments({ isLate: true });

		console.log("\n📊 Attendance Summary:");
		stats.forEach(stat => {
			console.log(`   ${stat._id}: ${stat.count} records`);
		});
		console.log(`   Late Arrivals: ${lateCount} records`);

		console.log("\n✅ Attendance data seeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding attendance data:", error);
		process.exit(1);
	}
};

seedAttendance();
