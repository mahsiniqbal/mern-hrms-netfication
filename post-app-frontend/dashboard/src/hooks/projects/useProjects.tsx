import { useState, useEffect, useCallback } from "react";
import { IProject, IAddProjectParams } from "../../utils/api/types";
import {
	addProject,
	updateProject,
	deleteProject,
	fetchProjects,
} from "../../utils/api/services/projects";
import { ProjectFormData } from "../../types/types";
import {
	GridColDef,
	GridActionsCellItem,
	GridRowParams,
} from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import * as yup from "yup";
import { projectValidationSchema } from "../../forms/validationSchemas";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export const useProjects = () => {
	const [projects, setProjects] = useState<IProject[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [openDialog, setOpenDialog] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<IProject | null>(null);
	const [formData, setFormData] = useState<ProjectFormData>({
		projectName: "",
		projectCode: "",
		description: "",
		clientName: "",
		startDate: new Date().toISOString().split("T")[0],
		endDate: "",
		status: "Planning",
		priority: "Medium",
		budget: "",
		totalHoursAllocated: "",
		teamSize: "",
		projectManager: "",
		progress: "0",
	});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

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
				setRefreshTrigger(prev => prev + 1);
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
				setRefreshTrigger(prev => prev + 1);
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
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to delete project:", err);
				throw err;
			}
		},
		[]
	);

	// Refresh data manually
	const refresh = useCallback(() => {
		setRefreshTrigger(prev => prev + 1);
	}, []);

	const handleAddClick = () => {
		setEditMode(false);
		setSelectedProject(null);
		setFormData({
			projectName: "",
			projectCode: "",
			description: "",
			clientName: "",
			startDate: new Date().toISOString().split("T")[0],
			endDate: "",
			status: "Planning",
			priority: "Medium",
			budget: "",
			totalHoursAllocated: "",
			teamSize: "",
			projectManager: "",
			progress: "0",
		});
		setValidationErrors({});
		setOpenDialog(true);
	};

	const handleEditClick = (project: IProject) => {
		setEditMode(true);
		setSelectedProject(project);
		setFormData({
			projectName: project.projectName,
			projectCode: project.projectCode,
			description: project.description || "",
			clientName: project.clientName || "",
			startDate: new Date(project.startDate).toISOString().split("T")[0],
			endDate: project.endDate
				? new Date(project.endDate).toISOString().split("T")[0]
				: "",
			status: project.status,
			priority: project.priority,
			budget: project.budget?.toString() || "",
			totalHoursAllocated: project.totalHoursAllocated?.toString() || "",
			teamSize: project.teamSize?.toString() || "",
			projectManager: project.projectManager || "",
			progress: project.progress?.toString() || "0",
		});
		setValidationErrors({});
		setOpenDialog(true);
	};

	const handleDeleteClick = (project: IProject) => {
		setDeleteTarget(project);
		setConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (deleteTarget) {
			try {
				await removeProject(deleteTarget.id);
				setConfirmDialogOpen(false);
				setDeleteTarget(null);
			} catch (error) {
				console.error("Failed to delete project:", error);
				alert("Failed to delete project");
			}
		}
	};

	const handleCancelDelete = () => {
		setConfirmDialogOpen(false);
		setDeleteTarget(null);
	};

	const handleInputChange = (field: keyof ProjectFormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear validation error for this field
		if (validationErrors[field]) {
			setValidationErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	const handleSave = async () => {
		try {
			// Validate form data
			const dataToValidate = {
				projectName: formData.projectName,
				projectCode: formData.projectCode,
				description: formData.description || undefined,
				clientName: formData.clientName || undefined,
				startDate: new Date(formData.startDate),
				endDate: formData.endDate ? new Date(formData.endDate) : undefined,
				status: formData.status,
				priority: formData.priority,
				budget: formData.budget ? parseFloat(formData.budget) : undefined,
				totalHoursAllocated: formData.totalHoursAllocated
					? parseFloat(formData.totalHoursAllocated)
					: undefined,
				teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
				projectManager: formData.projectManager || undefined,
				progress: formData.progress ? parseFloat(formData.progress) : undefined,
			};

			await projectValidationSchema.validate(dataToValidate, {
				abortEarly: false,
			});

			// Clear any previous validation errors
			setValidationErrors({});

			// Save data
			const saveData = {
				projectName: formData.projectName,
				projectCode: formData.projectCode,
				description: formData.description || undefined,
				clientName: formData.clientName || undefined,
				startDate: new Date(formData.startDate),
				endDate: formData.endDate ? new Date(formData.endDate) : undefined,
				status: formData.status as
					| "Planning"
					| "Active"
					| "On Hold"
					| "Completed"
					| "Cancelled",
				priority: formData.priority as "Low" | "Medium" | "High" | "Critical",
				budget: formData.budget ? parseFloat(formData.budget) : undefined,
				totalHoursAllocated: formData.totalHoursAllocated
					? parseFloat(formData.totalHoursAllocated)
					: undefined,
				teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
				projectManager: formData.projectManager || undefined,
				progress: formData.progress ? parseFloat(formData.progress) : undefined,
			};

			if (editMode && selectedProject) {
				await updateProjectRecord({
					...selectedProject,
					...saveData,
				});
			} else {
				await createProject(saveData as IAddProjectParams);
			}

			setOpenDialog(false);
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				// Convert yup errors to object format
				const errors: Record<string, string> = {};
				error.inner.forEach(err => {
					if (err.path) {
						errors[err.path] = err.message;
					}
				});
				setValidationErrors(errors);
			} else {
				console.error("Failed to save project:", error);
				alert("Failed to save project");
			}
		}
	};

	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "ID",
			width: 70,
			align: "center",
			headerAlign: "center",
		},
		{
			field: "projectCode",
			headerName: "Code",
			flex: 0.8,
			minWidth: 100,
		},
		{
			field: "projectName",
			headerName: "Project Name",
			flex: 1.2,
			minWidth: 180,
		},
		{
			field: "clientName",
			headerName: "Client",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "status",
			headerName: "Status",
			flex: 0.8,
			minWidth: 120,
			renderCell: params => {
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
						label={params.value}
						color={colorMap[params.value] || "default"}
						size="small"
						sx={{ fontWeight: 600 }}
					/>
				);
			},
		},
		{
			field: "priority",
			headerName: "Priority",
			flex: 0.7,
			minWidth: 100,
			renderCell: params => {
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
						label={params.value}
						color={colorMap[params.value] || "default"}
						size="small"
						sx={{ fontWeight: 600 }}
					/>
				);
			},
		},
		{
			field: "progress",
			headerName: "Progress",
			flex: 0.7,
			minWidth: 100,
			valueFormatter: value => (value !== undefined ? `${value}%` : "0%"),
		},
		{
			field: "startDate",
			headerName: "Start Date",
			flex: 0.8,
			minWidth: 110,
			valueFormatter: value => {
				if (!value) return "";
				return new Date(value).toLocaleDateString();
			},
		},
		{
			field: "endDate",
			headerName: "End Date",
			flex: 0.8,
			minWidth: 110,
			valueFormatter: value => {
				if (!value) return "";
				return new Date(value).toLocaleDateString();
			},
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Actions",
			width: 100,
			getActions: (params: GridRowParams<IProject>) => [
				<GridActionsCellItem
					icon={<EditIcon />}
					label="Edit"
					onClick={() => handleEditClick(params.row)}
					color="primary"
				/>,
				<GridActionsCellItem
					icon={<DeleteIcon color="error" />}
					label="Delete"
					onClick={() => handleDeleteClick(params.row)}
				/>,
			],
		},
	];

	return {
		projects,
		loading,
		error,
		createProject,
		updateProjectRecord,
		removeProject,
		refresh,
		columns,
		handleAddClick,
		handleCancelDelete,
		handleConfirmDelete,
		handleSave,
		openDialog,
		setOpenDialog,
		ConfirmDialog,
		editMode,
		formData,
		handleInputChange,
		validationErrors,
		confirmDialogOpen,
		deleteTarget,
	};
};
