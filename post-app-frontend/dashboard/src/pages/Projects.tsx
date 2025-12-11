import { useState } from "react";
import {
	DataGrid,
	GridColDef,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from "@mui/x-data-grid";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Box,
	Typography,
	Paper,
	Chip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { IProject, IAddProjectParams } from "../utils/api/types";
import { useProjects } from "../hooks/projects/useProjects";
import * as yup from "yup";
import { PROJECT_STATUS, PROJECT_PRIORITY } from "../constants";
import { ConfirmDialog } from "../components/ConfirmDialog";

// Yup validation schema
const projectValidationSchema = yup.object({
	projectName: yup.string().required("Project name is required").min(2, "Project name must be at least 2 characters"),
	projectCode: yup.string().required("Project code is required").min(2, "Project code must be at least 2 characters"),
	description: yup.string().notRequired(),
	clientName: yup.string().notRequired(),
	startDate: yup.date().required("Start date is required"),
	endDate: yup.date().notRequired().min(yup.ref('startDate'), "End date must be after start date"),
	status: yup.string().required("Status is required").oneOf(PROJECT_STATUS as unknown as string[], "Invalid status"),
	priority: yup.string().required("Priority is required").oneOf(PROJECT_PRIORITY as unknown as string[], "Invalid priority"),
	budget: yup.number().min(0, "Budget must be positive").notRequired(),
	totalHoursAllocated: yup.number().min(0, "Hours allocated must be positive").notRequired(),
	teamSize: yup.number().integer("Team size must be a whole number").min(0, "Team size must be positive").notRequired(),
	projectManager: yup.string().notRequired(),
	progress: yup.number().min(0, "Progress must be at least 0").max(100, "Progress cannot exceed 100").notRequired(),
});

interface ProjectFormData {
	projectName: string;
	projectCode: string;
	description: string;
	clientName: string;
	startDate: string;
	endDate: string;
	status: string;
	priority: string;
	budget: string;
	totalHoursAllocated: string;
	teamSize: string;
	projectManager: string;
	progress: string;
}

const ProjectsPage = () => {
	const { projects, loading, createProject, updateProjectRecord, removeProject } = useProjects();
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
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

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
			endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
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
				totalHoursAllocated: formData.totalHoursAllocated ? parseFloat(formData.totalHoursAllocated) : undefined,
				teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
				projectManager: formData.projectManager || undefined,
				progress: formData.progress ? parseFloat(formData.progress) : undefined,
			};

			await projectValidationSchema.validate(dataToValidate, { abortEarly: false });

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
				status: formData.status as "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled",
				priority: formData.priority as "Low" | "Medium" | "High" | "Critical",
				budget: formData.budget ? parseFloat(formData.budget) : undefined,
				totalHoursAllocated: formData.totalHoursAllocated ? parseFloat(formData.totalHoursAllocated) : undefined,
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
			renderCell: (params) => {
				const colorMap: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
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
			renderCell: (params) => {
				const colorMap: Record<string, "default" | "info" | "warning" | "error"> = {
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
			valueFormatter: (value) => value !== undefined ? `${value}%` : "0%",
		},
		{
			field: "startDate",
			headerName: "Start Date",
			flex: 0.8,
			minWidth: 110,
			valueFormatter: (value) => {
				if (!value) return "";
				return new Date(value).toLocaleDateString();
			},
		},
		{
			field: "endDate",
			headerName: "End Date",
			flex: 0.8,
			minWidth: 110,
			valueFormatter: (value) => {
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
					icon={<DeleteIcon />}
					label="Delete"
					onClick={() => handleDeleteClick(params.row)}
					color="error"
				/>,
			],
		},
	];

	return (
		<Box sx={{ height: "100%", width: "100%", p: 3 }}>
			<Paper elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
				<Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
					<Typography variant="h5" component="h1" fontWeight="bold">
						Projects Management
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAddClick}
						sx={{ textTransform: "none" }}
					>
						Add Project
					</Button>
				</Box>
				<Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
					<DataGrid
						rows={projects}
						columns={columns}
						loading={loading}
						pageSizeOptions={[5, 10, 25, 50]}
						paginationModel={paginationModel}
						onPaginationModelChange={setPaginationModel}
						disableRowSelectionOnClick
						slots={{ toolbar: GridToolbar }}
						slotProps={{
							toolbar: {
								showQuickFilter: true,
								quickFilterProps: { debounceMs: 500 },
							},
						}}
						sx={{
							border: "none",
							"& .MuiDataGrid-cell:focus": {
								outline: "none",
							},
						}}
					/>
				</Box>
			</Paper>

			{/* Edit/Add Dialog */}
			<Dialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					{editMode ? "Edit Project" : "Add New Project"}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
							<TextField
								label="Project Name"
								fullWidth
								value={formData.projectName}
								onChange={(e) => handleInputChange("projectName", e.target.value)}
								error={!!validationErrors.projectName}
								helperText={validationErrors.projectName}
								required
							/>
							<TextField
								label="Project Code"
								fullWidth
								value={formData.projectCode}
								onChange={(e) => handleInputChange("projectCode", e.target.value)}
								error={!!validationErrors.projectCode}
								helperText={validationErrors.projectCode}
								required
								disabled={editMode}
							/>
						</Box>
						<TextField
							label="Description"
							fullWidth
							multiline
							rows={2}
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							error={!!validationErrors.description}
							helperText={validationErrors.description}
						/>
						<TextField
							label="Client Name"
							fullWidth
							value={formData.clientName}
							onChange={(e) => handleInputChange("clientName", e.target.value)}
							error={!!validationErrors.clientName}
							helperText={validationErrors.clientName}
						/>
						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
							<TextField
								label="Status"
								select
								fullWidth
								value={formData.status}
								onChange={(e) => handleInputChange("status", e.target.value)}
								error={!!validationErrors.status}
								helperText={validationErrors.status}
								required
							>
								{PROJECT_STATUS.map((status) => (
									<MenuItem key={status} value={status}>
										{status}
									</MenuItem>
								))}
							</TextField>
							<TextField
								label="Priority"
								select
								fullWidth
								value={formData.priority}
								onChange={(e) => handleInputChange("priority", e.target.value)}
								error={!!validationErrors.priority}
								helperText={validationErrors.priority}
								required
							>
								{PROJECT_PRIORITY.map((priority) => (
									<MenuItem key={priority} value={priority}>
										{priority}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
							<TextField
								label="Start Date"
								type="date"
								fullWidth
								value={formData.startDate}
								onChange={(e) => handleInputChange("startDate", e.target.value)}
								error={!!validationErrors.startDate}
								helperText={validationErrors.startDate}
								required
								InputLabelProps={{ shrink: true }}
							/>
							<TextField
								label="End Date"
								type="date"
								fullWidth
								value={formData.endDate}
								onChange={(e) => handleInputChange("endDate", e.target.value)}
								error={!!validationErrors.endDate}
								helperText={validationErrors.endDate}
								InputLabelProps={{ shrink: true }}
							/>
						</Box>
						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
							<TextField
								label="Budget"
								type="number"
								fullWidth
								value={formData.budget}
								onChange={(e) => handleInputChange("budget", e.target.value)}
								error={!!validationErrors.budget}
								helperText={validationErrors.budget}
								inputProps={{ min: 0, step: 1000 }}
							/>
							<TextField
								label="Hours Allocated"
								type="number"
								fullWidth
								value={formData.totalHoursAllocated}
								onChange={(e) => handleInputChange("totalHoursAllocated", e.target.value)}
								error={!!validationErrors.totalHoursAllocated}
								helperText={validationErrors.totalHoursAllocated}
								inputProps={{ min: 0, step: 10 }}
							/>
							<TextField
								label="Team Size"
								type="number"
								fullWidth
								value={formData.teamSize}
								onChange={(e) => handleInputChange("teamSize", e.target.value)}
								error={!!validationErrors.teamSize}
								helperText={validationErrors.teamSize}
								inputProps={{ min: 0, step: 1 }}
							/>
						</Box>
						<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
							<TextField
								label="Project Manager"
								fullWidth
								value={formData.projectManager}
								onChange={(e) => handleInputChange("projectManager", e.target.value)}
								error={!!validationErrors.projectManager}
								helperText={validationErrors.projectManager}
							/>
							<TextField
								label="Progress (%)"
								type="number"
								fullWidth
								value={formData.progress}
								onChange={(e) => handleInputChange("progress", e.target.value)}
								error={!!validationErrors.progress}
								helperText={validationErrors.progress}
								inputProps={{ min: 0, max: 100, step: 5 }}
							/>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDialog(false)}>Cancel</Button>
					<Button onClick={handleSave} variant="contained">
						{editMode ? "Update" : "Create"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				open={confirmDialogOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title="Delete Project"
				message={`Are you sure you want to delete project "${deleteTarget?.projectName}" (${deleteTarget?.projectCode})? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				confirmColor="error"
			/>
		</Box>
	);
};

export default ProjectsPage;
