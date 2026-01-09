import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import Layout from "./layouts/dashboard";
import DashboardPage from "./pages/Dashboard";
import EmployeesCrudPage from "./pages/Employees";
import AttendanceCrudPage from "./pages/Attendance";
import ProjectsCrudPage from "./pages/Projects";
import EmployeeDetail from "./pages/EmployeeDetail";
import AttendanceDetail from "./pages/AttendanceDetail";
import ProjectDetail from "./pages/ProjectDetail";

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
						path: "employees",
						Component: EmployeesCrudPage,
					},
					{
						path: "employees/:employeeId",
						Component: EmployeeDetail,
					},
					{
						path: "attendance",
						Component: AttendanceCrudPage,
					},
					{
						path: "attendance/:attendanceId",
						Component: AttendanceDetail,
					},
					{
						path: "projects",
						Component: ProjectsCrudPage,
					},
					{
						path: "projects/:projectId",
						Component: ProjectDetail,
					},
				],
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<RouterProvider router={router} />
);
