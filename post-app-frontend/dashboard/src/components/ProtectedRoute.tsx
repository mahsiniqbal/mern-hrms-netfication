import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated, loading, user } = useAuth();
	const location = useLocation();

	console.log('🔒 ProtectedRoute:', { isAuthenticated, loading, user: user?.empName, path: location.pathname });

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated) {
		console.log('🔒 Not authenticated, redirecting to /login');
		return (
			<Navigate
				to="/login"
				replace
			/>
		);
	}

	// If first login and NOT already on change-password page, redirect there
	if (user?.isFirstLogin && location.pathname !== '/change-password') {
		console.log('🔒 First login, redirecting to /change-password');
		return (
			<Navigate
				to="/change-password"
				replace
			/>
		);
	}

	console.log('🔒 ProtectedRoute: Rendering children');

	return <>{children}</>;
};

export default ProtectedRoute;
