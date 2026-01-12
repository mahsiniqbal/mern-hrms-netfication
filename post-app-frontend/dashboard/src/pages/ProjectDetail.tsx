import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	Button,
	CircularProgress,
	Grid,
	Chip,
	Divider,
	IconButton,
	LinearProgress,
	TextField,
	MenuItem,
} from "@mui/material";
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
} from "@mui/icons-material";
import { IProject } from "../utils/api/types";
import {
	deleteProject,
	updateProject,
	fetchProject,
} from "../utils/api/services/projects";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PROJECT_STATUS, PROJECT_PRIORITY } from "../constants";
import { projectValidationSchema } from "../forms/validationSchemas";
import * as yup from "yup";

const ProjectDetail = () => {
	const { projectId } = useParams<{ projectId: string }>();
	const navigate = useNavigate();
	const [project, setProject] = useState<IProject | null>(null);
	const [loading, setLoading] = useState(true);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState<any>({});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		const loadProject = async () => {
			if (!projectId) return;

			try {
				setLoading(true);
				const project = await fetchProject(projectId);
				setProject(project);

				if (project) {
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
				}
			} catch (error) {
				console.error("Failed to fetch project:", error);
			} finally {
				setLoading(false);
			}
		};

		loadProject();
	}, [projectId]);

	const handleBack = () => {
		navigate("/projects");
	};

	const handleEdit = () => {
		setEditMode(true);
		setValidationErrors({});
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setValidationErrors({});
		// Reset form data to original project data
		if (project) {
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
		}
	};

	const handleSave = async () => {
		if (!project) return;

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
				...project,
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

			await updateProject(saveData);

			// Update local state
			setProject(saveData);
			setEditMode(false);
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

	const handleDelete = () => {
		setConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!project) return;

		try {
			await deleteProject(project.id);
			setConfirmDialogOpen(false);
			navigate("/projects");
		} catch (error) {
			console.error("Failed to delete project:", error);
			alert("Failed to delete project");
		}
	};

	const handleCancelDelete = () => {
		setConfirmDialogOpen(false);
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev: any) => ({ ...prev, [field]: value }));
		// Clear validation error for this field
		if (validationErrors[field]) {
			setValidationErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[field];
				return newErrors;
			});
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!project) {
		return (
			<Box sx={{ p: 3 }}>
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6">Project not found</Typography>
					<Button
						startIcon={<ArrowBackIcon />}
						onClick={handleBack}
						sx={{ mt: 2 }}
					>
						Back to List
					</Button>
				</Paper>
			</Box>
		);
	}

	const getStatusColor = (status: string) => {
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
		return colorMap[status] || "default";
	};

	const getPriorityColor = (priority: string) => {
		const colorMap: Record<string, "default" | "info" | "warning" | "error"> = {
			Low: "default",
			Medium: "info",
			High: "warning",
			Critical: "error",
		};
		return colorMap[priority] || "default";
	};

	return (
		<Box sx={{ height: "100%", width: "100%", p: 3 }}>
			<Paper
				elevation={2}
				sx={{ p: 3 }}
			>
				<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
					<IconButton
						onClick={handleBack}
						sx={{ mr: 2 }}
					>
						<ArrowBackIcon />
					</IconButton>
					<Typography
						variant="h5"
						component="h1"
						fontWeight="bold"
						sx={{ flexGrow: 1 }}
					>
						Project Details
					</Typography>
					{!editMode ? (
						<>
							<Button
								variant="outlined"
								startIcon={<EditIcon />}
								onClick={handleEdit}
								sx={{ mr: 1, textTransform: "none" }}
							>
								Edit
							</Button>
							<Button
								variant="outlined"
								color="error"
								startIcon={<DeleteIcon />}
								onClick={handleDelete}
								sx={{ textTransform: "none" }}
							>
								Delete
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outlined"
								startIcon={<CancelIcon />}
								onClick={handleCancelEdit}
								sx={{ mr: 1, textTransform: "none" }}
							>
								Cancel
							</Button>
							<Button
								variant="contained"
								startIcon={<SaveIcon />}
								onClick={handleSave}
								sx={{ textTransform: "none" }}
							>
								Save
							</Button>
						</>
					)}
				</Box>

				<Divider sx={{ mb: 3 }} />

				{editMode ? (
					<Grid
						display={"grid"}
						gridTemplateColumns={"1fr 1fr"}
						container
						spacing={2}
					>
						<Grid>
							<TextField
								label="Project Code"
								fullWidth
								value={formData.projectCode}
								disabled
							/>
						</Grid>

						<Grid>
							<TextField
								label="ID"
								fullWidth
								value={project.id}
								disabled
							/>
						</Grid>

						<Grid>
							<TextField
								label="Project Name"
								fullWidth
								value={formData.projectName}
								onChange={e => handleInputChange("projectName", e.target.value)}
								error={!!validationErrors.projectName}
								helperText={validationErrors.projectName}
								required
							/>
						</Grid>

						<Grid>
							<TextField
								label="Description"
								fullWidth
								multiline
								rows={2}
								value={formData.description}
								onChange={e => handleInputChange("description", e.target.value)}
								error={!!validationErrors.description}
								helperText={validationErrors.description}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Client Name"
								fullWidth
								value={formData.clientName}
								onChange={e => handleInputChange("clientName", e.target.value)}
								error={!!validationErrors.clientName}
								helperText={validationErrors.clientName}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Project Manager"
								fullWidth
								value={formData.projectManager}
								onChange={e =>
									handleInputChange("projectManager", e.target.value)
								}
								error={!!validationErrors.projectManager}
								helperText={validationErrors.projectManager}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Status"
								select
								fullWidth
								value={formData.status}
								onChange={e => handleInputChange("status", e.target.value)}
								error={!!validationErrors.status}
								helperText={validationErrors.status}
								required
							>
								{PROJECT_STATUS.map(status => (
									<MenuItem
										key={status}
										value={status}
									>
										{status}
									</MenuItem>
								))}
							</TextField>
						</Grid>

						<Grid>
							<TextField
								label="Priority"
								select
								fullWidth
								value={formData.priority}
								onChange={e => handleInputChange("priority", e.target.value)}
								error={!!validationErrors.priority}
								helperText={validationErrors.priority}
								required
							>
								{PROJECT_PRIORITY.map(priority => (
									<MenuItem
										key={priority}
										value={priority}
									>
										{priority}
									</MenuItem>
								))}
							</TextField>
						</Grid>

						<Grid>
							<TextField
								label="Start Date"
								type="date"
								fullWidth
								value={formData.startDate}
								onChange={e => handleInputChange("startDate", e.target.value)}
								error={!!validationErrors.startDate}
								helperText={validationErrors.startDate}
								required
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>

						<Grid>
							<TextField
								label="End Date"
								type="date"
								fullWidth
								value={formData.endDate}
								onChange={e => handleInputChange("endDate", e.target.value)}
								error={!!validationErrors.endDate}
								helperText={validationErrors.endDate}
								InputLabelProps={{ shrink: true }}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Budget"
								type="number"
								fullWidth
								value={formData.budget}
								onChange={e => handleInputChange("budget", e.target.value)}
								error={!!validationErrors.budget}
								helperText={validationErrors.budget}
								inputProps={{ min: 0, step: 1000 }}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Hours Allocated"
								type="number"
								fullWidth
								value={formData.totalHoursAllocated}
								onChange={e =>
									handleInputChange("totalHoursAllocated", e.target.value)
								}
								error={!!validationErrors.totalHoursAllocated}
								helperText={validationErrors.totalHoursAllocated}
								inputProps={{ min: 0, step: 10 }}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Team Size"
								type="number"
								fullWidth
								value={formData.teamSize}
								onChange={e => handleInputChange("teamSize", e.target.value)}
								error={!!validationErrors.teamSize}
								helperText={validationErrors.teamSize}
								inputProps={{ min: 0, step: 1 }}
							/>
						</Grid>

						<Grid>
							<TextField
								label="Progress (%)"
								type="number"
								fullWidth
								value={formData.progress}
								onChange={e => handleInputChange("progress", e.target.value)}
								error={!!validationErrors.progress}
								helperText={validationErrors.progress}
								inputProps={{ min: 0, max: 100, step: 5 }}
							/>
						</Grid>
					</Grid>
				) : (
					<Grid
						container
						spacing={3}
						display={"grid"}
						gridTemplateColumns={"1fr 1fr"}
					>
						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								ID
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.id}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Project Code
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.projectCode}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Project Name
							</Typography>
							<Typography
								variant="h6"
								sx={{ mb: 2 }}
							>
								{project.projectName}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Description
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.description || "No description"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Client Name
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.clientName || "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Project Manager
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.projectManager || "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Status
							</Typography>
							<Chip
								label={project.status}
								color={getStatusColor(project.status)}
								sx={{ fontWeight: 600 }}
							/>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Priority
							</Typography>
							<Chip
								label={project.priority}
								color={getPriorityColor(project.priority)}
								sx={{ fontWeight: 600 }}
							/>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Start Date
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{new Date(project.startDate).toLocaleDateString()}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								End Date
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.endDate
									? new Date(project.endDate).toLocaleDateString()
									: "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Budget
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.budget ? `$${project.budget.toLocaleString()}` : "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Hours Allocated
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.totalHoursAllocated
									? `${project.totalHoursAllocated}h`
									: "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Team Size
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{project.teamSize || "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Progress
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<Box sx={{ width: "100%", mr: 1 }}>
									<LinearProgress
										variant="determinate"
										value={project.progress || 0}
										sx={{ height: 10, borderRadius: 5 }}
									/>
								</Box>
								<Box sx={{ minWidth: 35 }}>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{project.progress || 0}%
									</Typography>
								</Box>
							</Box>
						</Grid>
					</Grid>
				)}
			</Paper>

			{confirmDialogOpen && (
				<ConfirmDialog
					open={confirmDialogOpen}
					onClose={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title="Delete Project"
					message={`Are you sure you want to delete project "${project.projectName}" (${project.projectCode})? This action cannot be undone.`}
					confirmText="Delete"
					cancelText="Cancel"
					confirmColor="error"
				/>
			)}
		</Box>
	);
};

export default ProjectDetail;
