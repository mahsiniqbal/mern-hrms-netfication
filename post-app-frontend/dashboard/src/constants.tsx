import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FolderIcon from "@mui/icons-material/Folder";
import type { Branding, Navigation } from "@toolpad/core/AppProvider";

export const DEPARTMENTS = [
	"Engineering",
	"Management",
	"QA / Testing",
	"DevOps",
	"Product Management",
	"UI/UX Design",
	"Sales",
	"Marketing",
	"Customer Support",
	"Human Resources",
	"Finance",
	"Operations",
	"Business Development",
];

export const ATTENDANCE_STATUS = [
	"Present",
	"Absent",
	"Half-Day",
	"Leave",
	"Holiday",
];

export const PROJECT_STATUS = [
	"Planning",
	"Active",
	"On Hold",
	"Completed",
	"Cancelled",
];

export const PROJECT_PRIORITY = ["Low", "Medium", "High", "Critical"] as const;

export const signInProviders = [
	{ id: "github", name: "GitHub" },
	{ id: "google", name: "Google" },
	{ id: "facebook", name: "Facebook" },
	{ id: "twitter", name: "Twitter" },
	{ id: "linkedin", name: "LinkedIn" },
];
export const NAVIGATION: Navigation = [
	{
		title: "Dashboard",
		icon: <DashboardIcon />,
	},
	{
		segment: "employees",
		title: "Employees",
		icon: <PersonIcon />,
		pattern: "employees{/:employeeId}*",
	},
	{
		segment: "attendance",
		title: "Attendance",
		icon: <CalendarMonthIcon />,
		pattern: "attendance{/:attendanceId}*",
	},
	{
		segment: "projects",
		title: "Projects",
		icon: <FolderIcon />,
		pattern: "projects{/:projectId}*",
	},
];

export const BRANDING: Branding = {
	title: "netfication",
	logo: (
		<img src="https://netfication.com/wp-content/uploads/2024/06/logo-icon-transparent-removebg-preview.webp"></img>
	),
	homeUrl: "https://netfication.com",
};
