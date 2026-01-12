import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Layout from "./layouts/dashboard";
import DashboardPage from "./pages/Dashboard";
import EmployeesCrudPage from "./pages/Employees";
import AttendanceCrudPage from "./pages/Attendance";
import ProjectsCrudPage from "./pages/Projects";
import EmployeeDetail from "./pages/EmployeeDetail";
import AttendanceDetail from "./pages/AttendanceDetail";
import ProjectDetail from "./pages/ProjectDetail";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
	{
		element: <App />,
		children: [
			{
				path: "/login",
				element: <Login />,
			},
			{
				path: "/change-password",
				element: (
					<ProtectedRoute>
						<ChangePassword />
					</ProtectedRoute>
				),
			},
			{
				path: "/",
				element: (
					<ProtectedRoute>
						<Layout />
					</ProtectedRoute>
				),
				children: [
					{ index: true, element: <DashboardPage /> },
					{ path: "employees", element: <EmployeesCrudPage /> },
					{ path: "employees/:employeeId", element: <EmployeeDetail /> },
					{ path: "attendance", element: <AttendanceCrudPage /> },
					{ path: "attendance/:attendanceId", element: <AttendanceDetail /> },
					{ path: "projects", element: <ProjectsCrudPage /> },
					{ path: "projects/:projectId", element: <ProjectDetail /> },
				],
			},
		],
	},
]);
