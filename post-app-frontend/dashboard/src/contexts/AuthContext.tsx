import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import axios from "../utils/api/axios";

interface User {
	id: number;
	email: string;
	empName: string;
	role: "admin" | "user";
	isFirstLogin: boolean;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	loading: boolean;
	isAuthenticated: boolean;
	isAdmin: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
	checkAuth: () => Promise<void>;
	updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	console.log("✅ AuthProvider rendered");
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load token and user from localStorage on mount
	useEffect(() => {
		const savedToken = localStorage.getItem("authToken");
		const savedUser = localStorage.getItem("authUser");

		if (savedToken && savedUser) {
			setToken(savedToken);
			setUser(JSON.parse(savedUser));
		}
		setLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const response = await axios.post("/auth/login", { email, password });
			const { token: newToken, user: newUser } = response.data;

			// Save to state
			setToken(newToken);
			setUser(newUser);

			// Save to localStorage
			localStorage.setItem("authToken", newToken);
			localStorage.setItem("authUser", JSON.stringify(newUser));
		} catch (error: any) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const logout = () => {
		// Clear state
		setToken(null);
		setUser(null);

		// Clear localStorage
		localStorage.removeItem("authToken");
		localStorage.removeItem("authUser");
	};

	const changePassword = async (oldPassword: string, newPassword: string) => {
		try {
			await axios.post("/auth/change-password", {
				oldPassword,
				newPassword,
			});

			// Update isFirstLogin to false
			if (user) {
				const updatedUser = { ...user, isFirstLogin: false };
				setUser(updatedUser);
				localStorage.setItem("authUser", JSON.stringify(updatedUser));
			}
		} catch (error: any) {
			console.error("Change password error:", error);
			throw error;
		}
	};

	const checkAuth = async () => {
		try {
			if (!token) {
				setLoading(false);
				return;
			}

			const response = await axios.get("/auth/me");
			setUser(response.data);
			localStorage.setItem("authUser", JSON.stringify(response.data));
		} catch (error) {
			console.error("Auth check error:", error);
			logout();
		} finally {
			setLoading(false);
		}
	};

	const updateUser = (updates: Partial<User>) => {
		if (user) {
			const updatedUser = { ...user, ...updates };
			setUser(updatedUser);
			localStorage.setItem("authUser", JSON.stringify(updatedUser));
		}
	};

	const value: AuthContextType = {
		user,
		token,
		loading,
		isAuthenticated: !!token && !!user,
		isAdmin: user?.role === "admin",
		login,
		logout,
		changePassword,
		checkAuth,
		updateUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
