import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FolderIcon from "@mui/icons-material/Folder";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Branding, Navigation } from "@toolpad/core/AppProvider";

const NAVIGATION: Navigation = [
	{
		kind: "header",
		title: "",
	},
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

const BRANDING: Branding = {
	title: "netfication",
	logo: (
		<img src="https://netfication.com/wp-content/uploads/2024/06/logo-icon-transparent-removebg-preview.webp"></img>
	),
	homeUrl: "https://netfication.com",
};

export default function App() {
	return (
		<ReactRouterAppProvider
			navigation={NAVIGATION}
			branding={BRANDING}
		>
			<Outlet />
		</ReactRouterAppProvider>
	);
}
