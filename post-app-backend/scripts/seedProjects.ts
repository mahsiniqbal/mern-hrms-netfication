import mongoose from "mongoose";
import Project from "../models/Project";
import ProjectWorkLog from "../models/ProjectWorkLog";
import Emp from "../models/Emp";

// Project names and descriptions
const projectData = [
	{
		projectName: "E-Commerce Platform Redesign",
		projectCode: "ECOM-2025",
		description: "Complete overhaul of the existing e-commerce platform with modern UI/UX",
		clientName: "TechStore Inc",
		status: "Active",
		priority: "High",
		budget: 150000,
		totalHoursAllocated: 2000,
		teamSize: 8,
		projectManager: "John Smith",
		progress: 65,
	},
	{
		projectName: "Mobile Banking App",
		projectCode: "MBANK-2025",
		description: "Development of a secure mobile banking application for iOS and Android",
		clientName: "National Bank",
		status: "Active",
		priority: "Critical",
		budget: 250000,
		totalHoursAllocated: 3500,
		teamSize: 12,
		projectManager: "Sarah Johnson",
		progress: 45,
	},
	{
		projectName: "CRM System Integration",
		projectCode: "CRM-INT-2024",
		description: "Integration of third-party CRM with existing systems",
		clientName: "Sales Corp",
		status: "Completed",
		priority: "Medium",
		budget: 80000,
		totalHoursAllocated: 1200,
		teamSize: 5,
		projectManager: "Mike Davis",
		progress: 100,
	},
	{
		projectName: "Data Analytics Dashboard",
		projectCode: "DASH-2025",
		description: "Real-time analytics dashboard for business intelligence",
		clientName: "Analytics Pro",
		status: "Active",
		priority: "High",
		budget: 120000,
		totalHoursAllocated: 1800,
		teamSize: 6,
		projectManager: "Emily Chen",
		progress: 30,
	},
	{
		projectName: "Healthcare Portal",
		projectCode: "HEALTH-2025",
		description: "Patient management and appointment scheduling system",
		clientName: "MediCare Hospital",
		status: "On Hold",
		priority: "Medium",
		budget: 180000,
		totalHoursAllocated: 2500,
		teamSize: 10,
		projectManager: "David Lee",
		progress: 20,
	},
	{
		projectName: "Inventory Management System",
		projectCode: "INV-2024",
		description: "Warehouse and inventory tracking system",
		clientName: "Logistics Ltd",
		status: "Completed",
		priority: "Low",
		budget: 60000,
		totalHoursAllocated: 900,
		teamSize: 4,
		projectManager: "Lisa Wang",
		progress: 100,
	},
	{
		projectName: "AI Chatbot Integration",
		projectCode: "AI-BOT-2025",
		description: "Intelligent customer service chatbot with NLP",
		clientName: "Support Tech",
		status: "Planning",
		priority: "Medium",
		budget: 95000,
		totalHoursAllocated: 1400,
		teamSize: 7,
		projectManager: "Robert Brown",
		progress: 10,
	},
	{
		projectName: "Cloud Migration Project",
		projectCode: "CLOUD-2025",
		description: "Migration of on-premise infrastructure to cloud",
		clientName: "Enterprise Solutions",
		status: "Active",
		priority: "Critical",
		budget: 300000,
		totalHoursAllocated: 4000,
		teamSize: 15,
		projectManager: "Jennifer Martinez",
		progress: 55,
	},
];

// Helper function to get random hours
const getRandomHours = (): number => {
	return Math.floor(Math.random() * 8) + 1; // 1-8 hours
};

// Helper function to get random task description
const getRandomTaskDescription = (): string => {
	const tasks = [
		"Frontend development",
		"Backend API development",
		"Database optimization",
		"Code review and testing",
		"Bug fixing and debugging",
		"Documentation writing",
		"Client meeting and requirements",
		"UI/UX design implementation",
		"System architecture planning",
		"Performance optimization",
		"Security implementation",
		"Integration testing",
	];
	return tasks[Math.floor(Math.random() * tasks.length)];
};

const seedProjects = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect("mongodb://localhost:27017/hrms");
		console.log("MongoDB connected");

		// Clear existing project data
		await Project.deleteMany({});
		await ProjectWorkLog.deleteMany({});
		console.log("Cleared existing project data");

		// Get all employees
		const employees = await Emp.find();
		if (employees.length === 0) {
			console.log("No employees found. Please add employees first.");
			process.exit(1);
		}

		console.log(`Found ${employees.length} employees`);

		// Create projects
		const projects = [];
		for (const projData of projectData) {
			const today = new Date();
			const startDate = new Date(
				today.getFullYear(),
				today.getMonth() - Math.floor(Math.random() * 6), // 0-6 months ago
				1
			);

			let endDate = null;
			if (projData.status === "Completed") {
				endDate = new Date(
					today.getFullYear(),
					today.getMonth() - Math.floor(Math.random() * 3),
					28
				);
			} else if (projData.status === "Active" || projData.status === "On Hold") {
				endDate = new Date(
					today.getFullYear(),
					today.getMonth() + Math.floor(Math.random() * 6) + 1, // 1-6 months from now
					28
				);
			}

			const project = new Project({
				...projData,
				startDate,
				endDate,
			});

			projects.push(await project.save());
		}

		console.log(`✅ Created ${projects.length} projects`);

		// Generate work logs for the current year
		const workLogs = [];
		const today = new Date();
		const currentYear = today.getFullYear();
		const startDate = new Date(currentYear, 0, 1); // January 1st

		for (const project of projects) {
			// Skip cancelled or planning projects
			if (
				project.status === "Cancelled" ||
				project.status === "Planning"
			) {
				continue;
			}

			// Select random employees for this project (30-70% of total employees)
			const teamSize = Math.floor(
				employees.length * (0.3 + Math.random() * 0.4)
			);
			const projectEmployees = employees
				.sort(() => Math.random() - 0.5)
				.slice(0, teamSize);

			// Generate work logs for each employee
			for (const employee of projectEmployees) {
				// Generate logs from project start to today or project end
				const logStartDate = new Date(
					Math.max(project.startDate.getTime(), startDate.getTime())
				);
				const logEndDate =
					project.endDate && project.endDate < today
						? project.endDate
						: today;

				// Generate 2-4 work logs per week
				const currentDate = new Date(logStartDate);
				while (currentDate <= logEndDate) {
					const dayOfWeek = currentDate.getDay();
					// Skip weekends
					if (dayOfWeek !== 0 && dayOfWeek !== 6) {
						// 40% chance to log work on any given weekday
						if (Math.random() < 0.4) {
							workLogs.push({
								projectId: project.id,
								projectName: project.projectName,
								employeeId: employee.id,
								employeeName: employee.empName,
								date: new Date(currentDate),
								hoursWorked: getRandomHours(),
								taskDescription: getRandomTaskDescription(),
								notes: `Work on ${project.projectCode}`,
							});
						}
					}
					currentDate.setDate(currentDate.getDate() + 1);
				}
			}
		}

		console.log(
			`\n📅 Generating work logs from ${startDate.toLocaleDateString()} to ${today.toLocaleDateString()}`
		);
		console.log(`Inserting ${workLogs.length} work log records...`);

		const insertedLogs = await ProjectWorkLog.insertMany(workLogs);
		console.log(
			`✅ Successfully inserted ${insertedLogs.length} work log records`
		);

		// Update totalHoursWorked for each project
		for (const project of projects) {
			const totalHours = workLogs
				.filter(log => log.projectId === project.id)
				.reduce((sum, log) => sum + log.hoursWorked, 0);

			await Project.findOneAndUpdate(
				{ id: project.id },
				{ totalHoursWorked: totalHours }
			);
		}

		// Show summary
		const projectStats = await Project.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		]);

		console.log("\n📊 Project Summary:");
		projectStats.forEach(stat => {
			console.log(`   ${stat._id}: ${stat.count} projects`);
		});

		const totalHours = workLogs.reduce(
			(sum, log) => sum + log.hoursWorked,
			0
		);
		console.log(`\n   Total Hours Logged: ${totalHours} hours`);

		console.log("\n✅ Project data seeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding project data:", error);
		process.exit(1);
	}
};

seedProjects();
