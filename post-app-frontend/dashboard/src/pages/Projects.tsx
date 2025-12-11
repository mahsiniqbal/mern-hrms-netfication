import { DataGrid } from "@mui/x-data-grid";
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
	InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useProjects } from "../hooks/projects/useProjects";
import { PROJECT_STATUS, PROJECT_PRIORITY } from "../constants";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useState } from "react";
import { useNavigate } from "react-router";

const ProjectsPage = () => {
	const {
		projects,
		loading,
		handleAddClick,
		handleCancelDelete,
		handleConfirmDelete,
		handleSave,
		columns,
		openDialog,
		setOpenDialog,
		editMode,
		formData,
		handleInputChange,
		validationErrors,
		confirmDialogOpen,
		deleteTarget,
	} = useProjects();

	const navigate = useNavigate();
	const [searchText, setSearchText] = useState("");

	const filteredProjects = projects.filter((project) => {
		const searchLower = searchText.toLowerCase();
		return (
			project.id.toString().includes(searchLower) ||
			project.projectName.toLowerCase().includes(searchLower) ||
			project.projectCode.toLowerCase().includes(searchLower) ||
			project.clientName?.toLowerCase().includes(searchLower) ||
			project.status.toLowerCase().includes(searchLower) ||
			project.priority.toLowerCase().includes(searchLower) ||
			project.projectManager?.toLowerCase().includes(searchLower) ||
			project.description?.toLowerCase().includes(searchLower)
		);
	});

	const handleRowClick = (params: any) => {
		navigate(`/projects/${params.id}`);
	};

	return (
		<Box sx={{ height: "100%", width: "100%", p: 3 }}>
			<Paper
				elevation={2}
				sx={{ height: "100%", display: "flex", flexDirection: "column" }}
			>
				<Box
					sx={{
						p: 2,
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography
						variant="h5"
						component="h1"
						fontWeight="bold"
					>
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

				<Box sx={{ px: 2, pb: 2 }}>
					<TextField
						fullWidth
						variant="outlined"
						placeholder="Search projects..."
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
						sx={{ mb: 2 }}
					/>
				</Box>

				<Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
					<DataGrid
						rows={filteredProjects}
						columns={columns}
						loading={loading}
						hideFooter
						disableRowSelectionOnClick
						onRowClick={handleRowClick}
						sx={{
							border: "none",
							"& .MuiDataGrid-cell:focus": {
								outline: "none",
							},
							"& .MuiDataGrid-row": {
								cursor: "pointer",
							},
						}}
					/>
				</Box>
			</Paper>

			{openDialog && (
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
						<Box
							sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
						>
							<Box
								sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
							>
								<TextField
									label="Project Name"
									fullWidth
									value={formData.projectName}
									onChange={e =>
										handleInputChange("projectName", e.target.value)
									}
									error={!!validationErrors.projectName}
									helperText={validationErrors.projectName}
									required
								/>
								<TextField
									label="Project Code"
									fullWidth
									value={formData.projectCode}
									onChange={e =>
										handleInputChange("projectCode", e.target.value)
									}
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
								onChange={e => handleInputChange("description", e.target.value)}
								error={!!validationErrors.description}
								helperText={validationErrors.description}
							/>
							<TextField
								label="Client Name"
								fullWidth
								value={formData.clientName}
								onChange={e => handleInputChange("clientName", e.target.value)}
								error={!!validationErrors.clientName}
								helperText={validationErrors.clientName}
							/>
							<Box
								sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
							>
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
							</Box>
							<Box
								sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
							>
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
							</Box>
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr 1fr",
									gap: 2,
								}}
							>
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
							</Box>
							<Box
								sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
							>
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
							</Box>
						</Box>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setOpenDialog(false)}>Cancel</Button>
						<Button
							onClick={handleSave}
							variant="contained"
						>
							{editMode ? "Update" : "Create"}
						</Button>
					</DialogActions>
				</Dialog>
			)}

			{confirmDialogOpen && (
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
			)}
		</Box>
	);
};

export default ProjectsPage;
