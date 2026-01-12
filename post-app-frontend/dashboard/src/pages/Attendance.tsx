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
	Autocomplete,
	InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useAttendance } from "../hooks/attendance/useAttendance";
import { ATTENDANCE_STATUS } from "../constants";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AttendancePage = () => {
	const { isAdmin } = useAuth();
	const {
		attendance,
		employees,
		loading,
		confirmDialogOpen,
		deleteTarget,
		editMode,
		formData,
		handleAddClick,
		handleInputChange,
		handleSave,
		validationErrors,
		columns,
		openDialog,
		setOpenDialog,
		handleEmployeeChange,
		handleCancelDelete,
		handleConfirmDelete,
	} = useAttendance({ isAdmin });

	const navigate = useNavigate();
	const [searchText, setSearchText] = useState("");

	const filteredAttendance = attendance.filter(record => {
		const searchLower = searchText.toLowerCase();
		return (
			record.id.toString().includes(searchLower) ||
			record.employeeName.toLowerCase().includes(searchLower) ||
			record.status.toLowerCase().includes(searchLower) ||
			new Date(record.date)
				.toLocaleDateString()
				.toLowerCase()
				.includes(searchLower) ||
			record.checkInTime?.toLowerCase().includes(searchLower) ||
			record.checkOutTime?.toLowerCase().includes(searchLower) ||
			record.notes?.toLowerCase().includes(searchLower)
		);
	});

	const handleRowClick = (params: any) => {
		navigate(`/attendance/${params.id}`);
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
						Attendance Management
					</Typography>

					{isAdmin && (
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={handleAddClick}
							sx={{ textTransform: "none" }}
						>
							Add Attendance
						</Button>
					)}
				</Box>

				<Box sx={{ px: 2, pb: 2 }}>
					<TextField
						fullWidth
						variant="outlined"
						placeholder="Search attendance records..."
						value={searchText}
						onChange={e => setSearchText(e.target.value)}
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

				<Box sx={{ height: "70vh", flexGrow: 1, px: 2, pb: 2 }}>
					<DataGrid
						rows={filteredAttendance}
						columns={columns}
						loading={loading}
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

			{/* Edit/Add Dialog */}
			{openDialog && (
				<Dialog
					open={openDialog}
					onClose={() => setOpenDialog(false)}
					maxWidth="md"
					fullWidth
				>
					<DialogTitle>
						{editMode ? "Edit Attendance Record" : "Add New Attendance Record"}
					</DialogTitle>
					<DialogContent>
						<Box
							sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
						>
							<Autocomplete
								options={employees}
								getOptionLabel={option =>
									`${option.empName} (ID: ${option.id})`
								}
								value={
									employees.find(emp => emp.id === formData.employeeId) || null
								}
								onChange={(_, newValue) => {
									if (newValue) {
										handleEmployeeChange(Number(newValue.id), newValue.empName);
									}
								}}
								disabled={editMode}
								renderInput={params => (
									<TextField
										{...params}
										label="Employee"
										required
										error={
											!!validationErrors.employeeId ||
											!!validationErrors.employeeName
										}
										helperText={
											validationErrors.employeeId ||
											validationErrors.employeeName
										}
									/>
								)}
							/>
							<TextField
								label="Date"
								type="date"
								fullWidth
								value={formData.date}
								onChange={e => handleInputChange("date", e.target.value)}
								error={!!validationErrors.date}
								helperText={validationErrors.date}
								required
								InputLabelProps={{ shrink: true }}
							/>
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
								{ATTENDANCE_STATUS.map(status => (
									<MenuItem
										key={status}
										value={status}
									>
										{status}
									</MenuItem>
								))}
							</TextField>
							<Box
								sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
							>
								<TextField
									label="Check In Time"
									type="time"
									fullWidth
									value={formData.checkInTime}
									onChange={e =>
										handleInputChange("checkInTime", e.target.value)
									}
									error={!!validationErrors.checkInTime}
									helperText={validationErrors.checkInTime}
									InputLabelProps={{ shrink: true }}
								/>
								<TextField
									label="Check Out Time"
									type="time"
									fullWidth
									value={formData.checkOutTime}
									onChange={e =>
										handleInputChange("checkOutTime", e.target.value)
									}
									error={!!validationErrors.checkOutTime}
									helperText={validationErrors.checkOutTime}
									InputLabelProps={{ shrink: true }}
								/>
							</Box>
							<Box
								sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
							>
								<TextField
									label="Work Hours"
									type="number"
									fullWidth
									value={formData.workHours}
									onChange={e => handleInputChange("workHours", e.target.value)}
									error={!!validationErrors.workHours}
									helperText={validationErrors.workHours}
									inputProps={{ step: 0.5, min: 0, max: 24 }}
								/>
								<TextField
									label="Punctuality"
									select
									fullWidth
									value={formData.isLate ? "late" : "ontime"}
									onChange={e =>
										handleInputChange("isLate", e.target.value === "late")
									}
								>
									<MenuItem value="ontime">On Time</MenuItem>
									<MenuItem value="late">Late</MenuItem>
								</TextField>
							</Box>
							<TextField
								label="Notes"
								fullWidth
								multiline
								rows={3}
								value={formData.notes}
								onChange={e => handleInputChange("notes", e.target.value)}
								error={!!validationErrors.notes}
								helperText={validationErrors.notes}
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
					title="Delete Attendance Record"
					message={`Are you sure you want to delete the attendance record for ${deleteTarget?.employeeName} on ${deleteTarget?.date ? new Date(deleteTarget.date).toLocaleDateString() : ""}? This action cannot be undone.`}
					confirmText="Delete"
					cancelText="Cancel"
					confirmColor="error"
				/>
			)}
		</Box>
	);
};

export default AttendancePage;
