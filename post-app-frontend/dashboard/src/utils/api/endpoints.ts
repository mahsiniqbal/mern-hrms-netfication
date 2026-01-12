const API = {
	// Auth endpoints
	LOGIN: "/auth/login",
	CHANGE_PASSWORD: "/auth/change-password",
	ME: "/auth/me",

	// Other endpoints
	PROFILE: "/user/profile",
	EMPLOYESS: "/employees",
	ATTENDANCE: "/attendance",
	PROJECTS: "/projects",
	PROJECT_WORK_LOGS: "/project-work-logs",
} as const;

export default API;
