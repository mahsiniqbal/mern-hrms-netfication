import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import Layout from "./layouts/dashboard";
import DashboardPage from "./pages/Dashboard";
import EmployeesCrudPage from "./pages/Employees";
import AttendanceCrudPage from "./pages/Attendance";
import ProjectsCrudPage from "./pages/Projects";

export const router = createBrowserRouter([
	{
		Component: App,
		children: [
			{
				path: "/",
				Component: Layout,
				children: [
					{
						path: "",
						Component: DashboardPage,
					},
					{
						path: "employees/:employeeId?/*",
						Component: EmployeesCrudPage,
					},
					{
						path: "attendance/:attendanceId?/*",
						Component: AttendanceCrudPage,
					},
					{
						path: "projects/:projectId?/*",
						Component: ProjectsCrudPage,
					},
				],
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
