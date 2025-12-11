import { useEffect, useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ToggleButtonGroup,
	ToggleButton,
	Paper,
	Stack,
} from "@mui/material";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { useEmployeesServices } from "../hooks/employees/useEmployeesServices";
import {
	fetchAttendanceStats,
	fetchAttendanceTrends,
} from "../utils/api/services/attendance";
import {
	fetchProjectStats,
	fetchProjectTrends,
	fetchEmployeeWorkRate,
} from "../utils/api/services/projects";
import {
	IAttendanceStats,
	IAttendanceTrend,
	IProjectStats,
	IProjectTrend,
	IEmployeeWorkRate,
} from "../utils/api/types";
import { useProjectsServices } from "../hooks/projects/useProjectsServices";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const DashboardPage = () => {
	const { employees } = useEmployeesServices();
	const { projects } = useProjectsServices();
	const [selectedEmployee, setSelectedEmployee] = useState<number | "all">(
		"all"
	);
	const [selectedProject, setSelectedProject] = useState<number | "all">("all");
	const [period, setPeriod] = useState<"week" | "month" | "year">("month");
	const [stats, setStats] = useState<IAttendanceStats[]>([]);
	const [trends, setTrends] = useState<IAttendanceTrend[]>([]);
	const [projectStats, setProjectStats] = useState<IProjectStats[]>([]);
	const [projectTrends, setProjectTrends] = useState<IProjectTrend[]>([]);
	const [employeeWorkRate, setEmployeeWorkRate] = useState<IEmployeeWorkRate[]>(
		[]
	);
	const [loading, setLoading] = useState(false);

	const currentDate = new Date();
	const [year, setYear] = useState(currentDate.getFullYear());
	const [month, setMonth] = useState(currentDate.getMonth() + 1);

	useEffect(() => {
		loadAttendanceData();
		loadProjectData();
	}, [selectedEmployee, selectedProject, period, year, month]);

	const loadAttendanceData = async () => {
		setLoading(true);
		try {
			const params = {
				employeeId: selectedEmployee !== "all" ? selectedEmployee : undefined,
				period,
				year,
				month,
			};

			const [statsData, trendsData] = await Promise.all([
				fetchAttendanceStats(params),
				fetchAttendanceTrends(params),
			]);

			setStats(statsData);
			setTrends(trendsData);
		} catch (error) {
			console.error("Failed to load attendance data:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadProjectData = async () => {
		setLoading(true);
		try {
			const params = {
				projectId: selectedProject !== "all" ? selectedProject : undefined,
				period,
				year,
				month,
			};

			const [statsData, trendsData, workRateData] = await Promise.all([
				fetchProjectStats(params),
				fetchProjectTrends(params),
				fetchEmployeeWorkRate(params),
			]);

			setProjectStats(statsData);
			setProjectTrends(trendsData);
			setEmployeeWorkRate(workRateData);
		} catch (error) {
			console.error("Failed to load project data:", error);
		} finally {
			setLoading(false);
		}
	};

	// Calculate highest attendance score
	const highestAttendance =
		stats.length > 0
			? stats.reduce((prev, current) =>
					prev.attendancePercentage > current.attendancePercentage
						? prev
						: current
				)
			: null;

	// Format trends data for charts
	const formatTrendsData = () => {
		return trends.map(trend => {
			let label = "";
			if (period === "year") {
				const monthNames = [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				];
				label = monthNames[trend._id - 1];
			} else if (period === "month") {
				label = `Day ${trend._id}`;
			} else {
				const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
				label = dayNames[trend._id - 1];
			}

			return {
				name: label,
				Present: trend.present,
				Absent: trend.absent,
				"Half-Day": trend.halfDay,
				Leave: trend.leave,
				Late: trend.late,
			};
		});
	};

	// Format stats data for pie chart
	const formatStatsForPie = () => {
		if (stats.length === 0) return [];

		const aggregated = stats.reduce(
			(acc, stat) => {
				acc.present += stat.presentDays;
				acc.absent += stat.absentDays;
				acc.halfDay += stat.halfDays;
				acc.leave += stat.leaveDays;
				return acc;
			},
			{ present: 0, absent: 0, halfDay: 0, leave: 0 }
		);

		return [
			{ name: "Present", value: aggregated.present },
			{ name: "Absent", value: aggregated.absent },
			{ name: "Half-Day", value: aggregated.halfDay },
			{ name: "Leave", value: aggregated.leave },
		];
	};

	// Format data for late/absent/leave summary chart
	const formatSummaryData = () => {
		if (trends.length === 0) return [];

		const aggregated = trends.reduce(
			(acc, trend) => {
				acc.present += trend.present;
				acc.late += trend.late;
				acc.absent += trend.absent;
				acc.leave += trend.leave;
				acc.halfDay += trend.halfDay;
				return acc;
			},
			{ present: 0, late: 0, absent: 0, leave: 0, halfDay: 0 }
		);

		return [
			{ name: "Present", value: aggregated.present, fill: "#00C49F" },
			{ name: "Late Arrivals", value: aggregated.late, fill: "#FF6B6B" },
			{ name: "Absent", value: aggregated.absent, fill: "#FF8042" },
			{ name: "Leave", value: aggregated.leave, fill: "#0088FE" },
			{ name: "Half-Day", value: aggregated.halfDay, fill: "#FFBB28" },
		];
	};

	// Format project trends data for charts
	const formatProjectTrendsData = () => {
		return projectTrends.map(trend => {
			let label = "";
			if (period === "year") {
				const monthNames = [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				];
				label = monthNames[trend._id - 1];
			} else if (period === "month") {
				label = `Day ${trend._id}`;
			} else {
				const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
				label = dayNames[trend._id - 1];
			}

			return {
				name: label,
				Hours: trend.totalHours,
			};
		});
	};

	return (
		<Box sx={{ p: 3 }}>
			<Typography
				variant="h4"
				gutterBottom
			>
				Attendance & Projects Dashboard
			</Typography>

			{/* Filters */}
			<Paper sx={{ p: 2, mb: 3 }}>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={2}
					alignItems={{ xs: "stretch", md: "center" }}
					flexWrap="wrap"
				>
					<Box sx={{ minWidth: { xs: "100%", md: 200 } }}>
						<FormControl fullWidth>
							<InputLabel>Employee</InputLabel>
							<Select
								value={selectedEmployee}
								onChange={e =>
									setSelectedEmployee(e.target.value as number | "all")
								}
								label="Employee"
							>
								<MenuItem value="all">All Employees</MenuItem>
								{employees.map(emp => (
									<MenuItem
										key={emp.id}
										value={emp.id}
									>
										{emp.empName}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					<ToggleButtonGroup
						value={period}
						exclusive
						onChange={(_, newPeriod) => {
							if (newPeriod) setPeriod(newPeriod);
						}}
						aria-label="time period"
					>
						<ToggleButton value="week">Week</ToggleButton>
						<ToggleButton value="month">Month</ToggleButton>
						<ToggleButton value="year">Year</ToggleButton>
					</ToggleButtonGroup>

					{period !== "week" && (
						<>
							<Box sx={{ minWidth: { xs: "100%", md: 120 } }}>
								<FormControl fullWidth>
									<InputLabel>Year</InputLabel>
									<Select
										value={year}
										onChange={e => setYear(e.target.value as number)}
										label="Year"
									>
										{[2023, 2024, 2025, 2026].map(y => (
											<MenuItem
												key={y}
												value={y}
											>
												{y}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>

							{period === "month" && (
								<Box sx={{ minWidth: { xs: "100%", md: 150 } }}>
									<FormControl fullWidth>
										<InputLabel>Month</InputLabel>
										<Select
											value={month}
											onChange={e => setMonth(e.target.value as number)}
											label="Month"
										>
											{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
												<MenuItem
													key={m}
													value={m}
												>
													{new Date(2024, m - 1).toLocaleString("default", {
														month: "long",
													})}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Box>
							)}
						</>
					)}
				</Stack>
			</Paper>

			{/* Stats Cards */}
			<Stack
				direction={{ xs: "column", md: "row" }}
				spacing={3}
				sx={{ mb: 3 }}
			>
				<Card sx={{ flex: 1 }}>
					<CardContent>
						<Typography
							color="textSecondary"
							gutterBottom
						>
							Highest Attendance
						</Typography>
						<Typography variant="h4">
							{highestAttendance
								? `${highestAttendance.attendancePercentage.toFixed(1)}%`
								: "N/A"}
						</Typography>
						<Typography
							variant="body2"
							color="textSecondary"
						>
							{highestAttendance?.employeeName || "No data"}
						</Typography>
					</CardContent>
				</Card>

				<Card sx={{ flex: 1 }}>
					<CardContent>
						<Typography
							color="textSecondary"
							gutterBottom
						>
							Total Records
						</Typography>
						<Typography variant="h4">
							{stats.reduce((acc, stat) => acc + stat.totalDays, 0)}
						</Typography>
						<Typography
							variant="body2"
							color="textSecondary"
						>
							Attendance entries
						</Typography>
					</CardContent>
				</Card>

				<Card sx={{ flex: 1 }}>
					<CardContent>
						<Typography
							color="textSecondary"
							gutterBottom
						>
							Average Attendance
						</Typography>
						<Typography variant="h4">
							{stats.length > 0
								? (
										stats.reduce(
											(acc, stat) => acc + stat.attendancePercentage,
											0
										) / stats.length
									).toFixed(1)
								: "0"}
							%
						</Typography>
						<Typography
							variant="body2"
							color="textSecondary"
						>
							Across all employees
						</Typography>
					</CardContent>
				</Card>
			</Stack>

			{/* Charts */}
			<Stack spacing={3}>
				{/* Line Chart and Pie Chart Row */}
				<Stack
					direction={{ xs: "column", lg: "row" }}
					spacing={3}
					sx={{ width: "100%" }}
				>
					{/* Line Chart - Attendance Trends */}
					<Card sx={{ flex: 2 }}>
						<CardContent>
							<Typography
								variant="h6"
								gutterBottom
							>
								Attendance Trends
							</Typography>
							<ResponsiveContainer
								width="100%"
								height={300}
							>
								<LineChart data={formatTrendsData()}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type="monotone"
										dataKey="Present"
										stroke="#00C49F"
										strokeWidth={2}
									/>
									<Line
										type="monotone"
										dataKey="Absent"
										stroke="#FF8042"
										strokeWidth={2}
									/>
									<Line
										type="monotone"
										dataKey="Half-Day"
										stroke="#FFBB28"
										strokeWidth={2}
									/>
									<Line
										type="monotone"
										dataKey="Leave"
										stroke="#0088FE"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Pie Chart - Status Distribution */}
					<Card sx={{ flex: 1 }}>
						<CardContent>
							<Typography
								variant="h6"
								gutterBottom
							>
								Status Distribution
							</Typography>
							<ResponsiveContainer
								width="100%"
								height={300}
							>
								<PieChart>
									<Pie
										data={formatStatsForPie()}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={entry => `${entry.name}: ${entry.value}`}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
									>
										{formatStatsForPie().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</Stack>

				{/* Bar Chart - Late/Absent/Leave Summary */}
				<Card>
					<CardContent>
						<Typography
							variant="h6"
							gutterBottom
						>
							Late Arrivals, Absences & Leaves Summary
						</Typography>
						<ResponsiveContainer
							width="100%"
							height={300}
						>
							<BarChart data={formatSummaryData()}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar
									dataKey="value"
									fill="#8884d8"
								>
									{formatSummaryData().map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.fill}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Bar Chart - Employee Comparison */}
				{selectedEmployee === "all" && stats.length > 0 && (
					<Card>
						<CardContent>
							<Typography
								variant="h6"
								gutterBottom
							>
								Employee Attendance Comparison
							</Typography>
							<ResponsiveContainer
								width="100%"
								height={300}
							>
								<BarChart data={stats}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="employeeName" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey="presentDays"
										fill="#00C49F"
										name="Present"
									/>
									<Bar
										dataKey="absentDays"
										fill="#FF8042"
										name="Absent"
									/>
									<Bar
										dataKey="halfDays"
										fill="#FFBB28"
										name="Half-Day"
									/>
									<Bar
										dataKey="leaveDays"
										fill="#0088FE"
										name="Leave"
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				)}

				{/* Individual Employee Stats */}
				{selectedEmployee !== "all" && stats.length > 0 && (
					<Card>
						<CardContent>
							<Typography
								variant="h6"
								gutterBottom
							>
								Detailed Statistics
							</Typography>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								spacing={2}
								flexWrap="wrap"
							>
								{stats.map(stat => (
									<Paper
										key={`total-${stat._id}`}
										sx={{ p: 2, flex: 1 }}
									>
										<Typography
											variant="subtitle2"
											color="textSecondary"
										>
											Total Days
										</Typography>
										<Typography variant="h6">{stat.totalDays}</Typography>
									</Paper>
								))}
								{stats.map(stat => (
									<Paper
										key={`hours-${stat._id}`}
										sx={{ p: 2, flex: 1 }}
									>
										<Typography
											variant="subtitle2"
											color="textSecondary"
										>
											Work Hours
										</Typography>
										<Typography variant="h6">
											{stat.totalWorkHours?.toFixed(1) || 0} hrs
										</Typography>
									</Paper>
								))}
							</Stack>
						</CardContent>
					</Card>
				)}

				{/* Projects Section */}
				<Box sx={{ mt: 5 }}>
					<Typography
						variant="h5"
						gutterBottom
						sx={{ mb: 3 }}
					>
						Project Management
					</Typography>

					{/* Project Filters */}
					<Paper sx={{ p: 2, mb: 3 }}>
						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={2}
						>
							<Box sx={{ minWidth: { xs: "100%", md: 250 } }}>
								<FormControl fullWidth>
									<InputLabel>Project</InputLabel>
									<Select
										value={selectedProject}
										onChange={e =>
											setSelectedProject(e.target.value as number | "all")
										}
										label="Project"
									>
										<MenuItem value="all">All Projects</MenuItem>
										{projects.map(proj => (
											<MenuItem
												key={proj.id}
												value={proj.id}
											>
												{proj.projectName}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Stack>
					</Paper>

					{/* Project Stats Cards */}
					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={3}
						sx={{ mb: 3 }}
					>
						<Card sx={{ flex: 1 }}>
							<CardContent>
								<Typography
									color="textSecondary"
									gutterBottom
								>
									Total Projects
								</Typography>
								<Typography variant="h4">{projectStats.length}</Typography>
								<Typography
									variant="body2"
									color="textSecondary"
								>
									Active projects
								</Typography>
							</CardContent>
						</Card>

						<Card sx={{ flex: 1 }}>
							<CardContent>
								<Typography
									color="textSecondary"
									gutterBottom
								>
									Total Hours Worked
								</Typography>
								<Typography variant="h4">
									{projectStats
										.reduce((acc, proj) => acc + proj.totalHoursWorked, 0)
										.toFixed(1)}
								</Typography>
								<Typography
									variant="body2"
									color="textSecondary"
								>
									Across all projects
								</Typography>
							</CardContent>
						</Card>

						<Card sx={{ flex: 1 }}>
							<CardContent>
								<Typography
									color="textSecondary"
									gutterBottom
								>
									Avg Progress
								</Typography>
								<Typography variant="h4">
									{projectStats.length > 0
										? (
												projectStats.reduce(
													(acc, proj) => acc + (proj.progress || 0),
													0
												) / projectStats.length
											).toFixed(1)
										: "0"}
									%
								</Typography>
								<Typography
									variant="body2"
									color="textSecondary"
								>
									Overall completion
								</Typography>
							</CardContent>
						</Card>
					</Stack>

					{/* Project Charts */}
					<Stack spacing={3}>
						{/* Line Chart - Project Hours Trends */}
						<Card>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
								>
									Project Work Hours Over Time
								</Typography>
								<ResponsiveContainer
									width="100%"
									height={300}
								>
									<LineChart data={formatProjectTrendsData()}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line
											type="monotone"
											dataKey="Hours"
											stroke="#8884D8"
											strokeWidth={2}
										/>
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>

						{/* Bar Chart - Employee Work Rate */}
						{employeeWorkRate.length > 0 && (
							<Card>
								<CardContent>
									<Typography
										variant="h6"
										gutterBottom
									>
										Employee Work Rate (%)
									</Typography>
									<ResponsiveContainer
										width="100%"
										height={300}
									>
										<BarChart data={employeeWorkRate}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="employeeName" />
											<YAxis />
											<Tooltip />
											<Legend />
											<Bar
												dataKey="workRatePercentage"
												fill="#8884D8"
												name="Work Rate %"
											/>
											<Bar
												dataKey="totalHours"
												fill="#82CA9D"
												name="Total Hours"
											/>
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						)}

						{/* Bar Chart - Project Status Distribution */}
						{selectedProject === "all" && projectStats.length > 0 && (
							<Card>
								<CardContent>
									<Typography
										variant="h6"
										gutterBottom
									>
										Project Hours by Project
									</Typography>
									<ResponsiveContainer
										width="100%"
										height={300}
									>
										<BarChart data={projectStats}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="projectName" />
											<YAxis />
											<Tooltip />
											<Legend />
											<Bar
												dataKey="totalHoursWorked"
												fill="#8884D8"
												name="Hours Worked"
											/>
											<Bar
												dataKey="totalHoursAllocated"
												fill="#82CA9D"
												name="Hours Allocated"
											/>
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						)}
					</Stack>
				</Box>
			</Stack>
		</Box>
	);
};

export default DashboardPage;
