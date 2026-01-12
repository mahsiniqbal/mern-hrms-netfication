import { Outlet } from "react-router-dom";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function AppProviders() {
	return (
		<AuthProvider>
			<Outlet />
		</AuthProvider>
	);
}
