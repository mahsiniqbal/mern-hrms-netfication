import { useEffect, useState } from "react";
import { IAddProjectParams, IProject } from "../../utils/api/types";
import {
	addProject,
	deleteProject,
	fetchProjects,
	updateProject,
} from "../../utils/api/services/projects";
import { DataSource, DataSourceCache } from "@toolpad/core/Crud";
import { z } from "zod";
import { PROJECT_PRIORITY, PROJECT_STATUS } from "../../constants";
import { Chip } from "@mui/material";

export const useProjectsServices = () => {
	const [projects, setProjects] = useState<IProject[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const projectCache = new DataSourceCache();
	const statusSchema = z.enum(PROJECT_STATUS);
	const prioritySchema = z.enum(PROJECT_PRIORITY);

	const loadProjects = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchProjects();
			if (data) {
				setProjects(data);
			}
		} catch (err: any) {
			setError("Failed to load projects");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadProjects();
	}, []);

	const addNewProject = async (data: IAddProjectParams) => {
		try {
			const newProject = await addProject(data);
			setProjects(prev => [...prev, newProject]);
		} catch (err) {
			console.error("Add project failed:", err);
			throw err;
		}
	};

	const deleteProjectData = async (id: string) => {
		try {
			await deleteProject(id);
			setProjects(prev => prev.filter(proj => proj.projectId !== id));
		} catch (err) {
			console.error("Delete project failed:", err);
			throw err;
		}
	};

	const ProjectDataSource: DataSource<IProject> = {
		fields: [
			{
				field: "id",
				headerName: "ID",
				flex: 0.5,
				align: "center",
				headerAlign: "center",
				editable: false,
			},
			{
				field: "projectCode",
				headerName: "Project Code",
				flex: 1,
				editable: false,
			},
			{
				field: "projectName",
				headerName: "Project Name",
				flex: 1.5,
			},
			{
				field: "clientName",
				headerName: "Client",
				flex: 1.2,
			},
			{
				field: "status",
				headerName: "Status",
				type: "singleSelect",
				flex: 1,
				valueOptions: [...PROJECT_STATUS],
				renderCell: (params: any) => {
					const status = params.row.status;
					const colorMap: Record<
						string,
						"default" | "primary" | "success" | "warning" | "error"
					> = {
						Planning: "default",
						Active: "primary",
						"On Hold": "warning",
						Completed: "success",
						Cancelled: "error",
					};
					return (
						<Chip
							label={status}
							color={colorMap[status] || "default"}
							size="small"
							sx={{ fontWeight: 600 }}
						/>
					);
				},
			},
			{
				field: "priority",
				headerName: "Priority",
				type: "singleSelect",
				flex: 0.8,
				valueOptions: [...PROJECT_PRIORITY],
				renderCell: (params: any) => {
					const priority = params.row.priority;
					const colorMap: Record<
						string,
						"default" | "info" | "warning" | "error"
					> = {
						Low: "default",
						Medium: "info",
						High: "warning",
						Critical: "error",
					};
					return (
						<Chip
							label={priority}
							color={colorMap[priority] || "default"}
							size="small"
							sx={{ fontWeight: 600 }}
						/>
					);
				},
			},
			{
				field: "progress",
				headerName: "Progress (%)",
				type: "number",
				flex: 0.8,
			},
			{
				field: "startDate",
				headerName: "Start Date",
				type: "date",
				flex: 1,
				valueGetter: value => value && new Date(value),
			},
			{
				field: "endDate",
				headerName: "End Date",
				type: "date",
				flex: 1,
				valueGetter: value => value && new Date(value),
			},
			{
				field: "projectManager",
				headerName: "Project Manager",
				flex: 1.2,
			},
			{
				field: "budget",
				headerName: "Budget",
				type: "number",
				flex: 0.8,
			},
			{
				field: "totalHoursAllocated",
				headerName: "Hours Allocated",
				type: "number",
				flex: 1,
			},
			{
				field: "totalHoursWorked",
				headerName: "Hours Worked",
				type: "number",
				flex: 1,
				editable: false,
			},
			{
				field: "teamSize",
				headerName: "Team Size",
				type: "number",
				flex: 0.8,
			},
			{
				field: "description",
				headerName: "Description",
				flex: 1.5,
			},
		],
		getMany: async ({ paginationModel, filterModel, sortModel }) => {
			const projectStore = projects;

			let filteredProjects = [...projectStore];

			// Apply filters
			if (filterModel?.items?.length) {
				filterModel.items.forEach(({ field, value, operator }) => {
					if (!field || value == null) {
						return;
					}

					filteredProjects = filteredProjects.filter(record => {
						const recordValue = record[field];

						switch (operator) {
							case "contains":
								return String(recordValue)
									.toLowerCase()
									.includes(String(value).toLowerCase());
							case "equals":
								return recordValue === value;
							case "startsWith":
								return String(recordValue)
									.toLowerCase()
									.startsWith(String(value).toLowerCase());
							case "endsWith":
								return String(recordValue)
									.toLowerCase()
									.endsWith(String(value).toLowerCase());
							case ">":
								return (recordValue as number) > value;
							case "<":
								return (recordValue as number) < value;
							default:
								return true;
						}
					});
				});
			}

			// Apply sorting
			if (sortModel?.length) {
				filteredProjects.sort((a, b) => {
					for (const { field, sort } of sortModel) {
						if ((a[field] as number) < (b[field] as number)) {
							return sort === "asc" ? -1 : 1;
						}
						if ((a[field] as number) > (b[field] as number)) {
							return sort === "asc" ? 1 : -1;
						}
					}
					return 0;
				});
			}

			// Apply pagination
			const start = paginationModel.page * paginationModel.pageSize;
			const end = start + paginationModel.pageSize;
			const paginatedProjects = filteredProjects.slice(start, end);

			return {
				items: paginatedProjects,
				itemCount: filteredProjects.length,
			};
		},
		getOne: async projectId => {
			const projectStore = projects;
			const projectToShow = projectStore.find(
				record => record.id === Number(projectId)
			);

			if (!projectToShow) {
				throw new Error("Project not found");
			}
			return projectToShow;
		},
		createOne: async data => {
			const newProject = {
				...data,
			} as IProject;
			await addProject({
				...newProject,
			});
			loadProjects();

			return newProject;
		},
		updateOne: async (projectId, data) => {
			const projectStore = projects;
			let updatedProject: IProject | null = null;
			setProjects(
				projectStore.map(record => {
					if (record.id === Number(projectId)) {
						updatedProject = { ...record, ...data };
						return updatedProject;
					}
					return record;
				})
			);
			updatedProject && updateProject(updatedProject);

			if (!updatedProject) {
				throw new Error("Project not found");
			}
			return updatedProject;
		},
		deleteOne: async projectId => {
			const projectStore = projects;
			deleteProject(projectId);
			setProjects(
				projectStore.filter(record => record.id !== Number(projectId))
			);
		},

		validate: z
			.object({
				projectName: z
					.string({ required_error: "Project Name is required" })
					.nonempty("Project Name is required"),
				projectCode: z
					.string({ required_error: "Project Code is required" })
					.nonempty("Project Code is required"),
				description: z.string().optional(),
				clientName: z.string().optional(),
				startDate: z.union([
					z.date(),
					z
						.string({ required_error: "Start Date is required" })
						.nonempty("Start Date is required")
						.transform(str => new Date(str)),
				]),
				endDate: z
					.union([z.date(), z.string().transform(str => new Date(str))])
					.optional(),
				status: statusSchema.refine(val => PROJECT_STATUS.includes(val), {
					message: `Status must be one of: ${PROJECT_STATUS.join(", ")}`,
				}),
				priority: prioritySchema.refine(val => PROJECT_PRIORITY.includes(val), {
					message: `Priority must be one of: ${PROJECT_PRIORITY.join(", ")}`,
				}),
				budget: z.coerce.number().optional(),
				totalHoursAllocated: z.coerce.number().optional(),
				totalHoursWorked: z.coerce.number().optional(),
				teamSize: z.coerce.number().optional(),
				projectManager: z.string().optional(),
				progress: z.coerce.number().min(0).max(100).optional(),
			})
			.passthrough()["~standard"].validate,
	};

	return {
		projects,
		loading,
		error,
		addProject: addNewProject,
		deleteProject: deleteProjectData,
		ProjectDataSource,
		projectCache,
		loadProjects,
	};
};
