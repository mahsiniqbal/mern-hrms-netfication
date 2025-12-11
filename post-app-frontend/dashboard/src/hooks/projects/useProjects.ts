import { useState, useEffect, useCallback } from "react";
import { IProject, IAddProjectParams } from "../../utils/api/types";
import {
	addProject,
	updateProject,
	deleteProject,
	fetchProjects,
} from "../../utils/api/services/projects";

export const useProjects = () => {
	const [projects, setProjects] = useState<IProject[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Fetch projects data
	useEffect(() => {
		const loadProjects = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchProjects();
				setProjects(data);
			} catch (err: any) {
				setError(err.message || "Failed to fetch projects");
				console.error("Failed to fetch projects:", err);
			} finally {
				setLoading(false);
			}
		};
		loadProjects();
	}, [refreshTrigger]);

	// Create new project
	const createProject = useCallback(
		async (data: IAddProjectParams): Promise<void> => {
			try {
				await addProject(data);
				setRefreshTrigger((prev) => prev + 1);
			} catch (err: any) {
				console.error("Failed to create project:", err);
				throw err;
			}
		},
		[]
	);

	// Update existing project
	const updateProjectRecord = useCallback(
		async (project: IProject): Promise<void> => {
			try {
				await updateProject(project);
				setRefreshTrigger((prev) => prev + 1);
			} catch (err: any) {
				console.error("Failed to update project:", err);
				throw err;
			}
		},
		[]
	);

	// Delete project
	const removeProject = useCallback(
		async (id: string | number): Promise<void> => {
			try {
				await deleteProject(id);
				setRefreshTrigger((prev) => prev + 1);
			} catch (err: any) {
				console.error("Failed to delete project:", err);
				throw err;
			}
		},
		[]
	);

	// Refresh data manually
	const refresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1);
	}, []);

	return {
		projects,
		loading,
		error,
		createProject,
		updateProjectRecord,
		removeProject,
		refresh,
	};
};
