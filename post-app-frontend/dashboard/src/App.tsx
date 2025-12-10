import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Branding, Navigation } from "@toolpad/core/AppProvider";

const NAVIGATION: Navigation = [
	{
		kind: "header",
		title: "Main items",
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
