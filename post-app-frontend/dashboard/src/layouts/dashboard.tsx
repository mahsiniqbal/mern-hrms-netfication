import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import type { Session, Router, Navigation } from "@toolpad/core/AppProvider";
import { useAuth } from "../contexts/AuthContext";
import { useMemo } from "react";
import { Chip } from "@mui/material";
import { BRANDING, NAVIGATION } from "../constants";

export default function Layout() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const session = useMemo<Session | null>(() => {
		if (!user) return null;

		return {
			user: {
				name: user.empName,
				email: user.email,
				image: undefined,
			},
		};
	}, [user]);

	const authentication = useMemo(
		() => ({
			signIn: () => {
				navigate("/login");
			},
			signOut: () => {
				logout();
				navigate("/login");
			},
		}),
		[logout, navigate]
	);

	// Create a router object that uses React Router's navigate
	const router = useMemo<Router>(() => {
		return {
			pathname: location.pathname,
			searchParams: new URLSearchParams(location.search),
			navigate: path => {
				navigate(path);
			},
		};
	}, [location.pathname, location.search, navigate]);

	return (
		<AppProvider
			navigation={NAVIGATION as Navigation}
			branding={BRANDING}
			session={session}
			authentication={authentication}
			router={router}
		>
			<DashboardLayout>
				{user && (
					<div
						style={{ position: "absolute", top: 20, right: 100, zIndex: 9999 }}
					>
						<Chip
							label={user.role === "admin" ? "Admin" : "User"}
							color={user.role === "admin" ? "primary" : "default"}
							size="small"
						/>
					</div>
				)}
				<Outlet />
			</DashboardLayout>
		</AppProvider>
	);
}
