import { DataGrid, GridToolbar } from "@mui/x-data-grid";
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
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useEmployees } from "../hooks/employees/useEmployees";
import { DEPARTMENTS } from "../constants";
import { ConfirmDialog } from "../components/ConfirmDialog";

const EmployeesPage = () => {
	const {
		employees,
		loading,
		editMode,
		openDialog,
		setOpenDialog,
		formData,
		handleAddClick,
		columns,
		handleInputChange,
		handleSave,
		confirmDialogOpen,
		handleConfirmDelete,
		handleCancelDelete,
		deleteTarget,
		validationErrors,
		paginationModel,
		setPaginationModel,
	} = useEmployees();

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
						Employees Management
					</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAddClick}
						sx={{ textTransform: "none" }}
					>
						Add Employee
					</Button>
				</Box>
				<Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
					<DataGrid
						rows={employees}
						columns={columns}
						loading={loading}
						hideFooter
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
			{openDialog && (
				<Dialog
					open={openDialog}
					onClose={() => setOpenDialog(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle>
						{editMode ? "Edit Employee" : "Add New Employee"}
					</DialogTitle>
					<DialogContent>
						<Box
							sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
						>
							<TextField
								label="Name"
								fullWidth
								value={formData.empName}
								onChange={e => handleInputChange("empName", e.target.value)}
								error={!!validationErrors.empName}
								helperText={validationErrors.empName}
								required
							/>
							<TextField
								label="Email"
								type="email"
								fullWidth
								value={formData.email}
								onChange={e => handleInputChange("email", e.target.value)}
								error={!!validationErrors.email}
								helperText={validationErrors.email}
								required
							/>
							<TextField
								label="Position"
								fullWidth
								value={formData.position}
								onChange={e => handleInputChange("position", e.target.value)}
								error={!!validationErrors.position}
								helperText={validationErrors.position}
								required
							/>
							<TextField
								label="Department"
								select
								fullWidth
								value={formData.department}
								onChange={e => handleInputChange("department", e.target.value)}
								error={!!validationErrors.department}
								helperText={validationErrors.department}
								required
							>
								{DEPARTMENTS.map(dept => (
									<MenuItem
										key={dept}
										value={dept}
									>
										{dept}
									</MenuItem>
								))}
							</TextField>
							<TextField
								label="Hire Date"
								type="date"
								fullWidth
								value={formData.hireDate}
								onChange={e => handleInputChange("hireDate", e.target.value)}
								error={!!validationErrors.hireDate}
								helperText={validationErrors.hireDate}
								required
								InputLabelProps={{ shrink: true }}
							/>
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
					title="Delete Employee"
					message={`Are you sure you want to delete ${deleteTarget?.empName}? This action cannot be undone.`}
					confirmText="Delete"
					cancelText="Cancel"
					confirmColor="error"
				/>
			)}
		</Box>
	);
};

export default EmployeesPage;
