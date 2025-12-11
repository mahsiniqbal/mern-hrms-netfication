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
	Autocomplete,
} from "@mui/material";
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
} from "@mui/icons-material";
import { IAttendance, IAddAttendanceParams } from "../utils/api/types";
import { useAttendance } from "../hooks/attendance/useAttendance";
import * as yup from "yup";
import { ATTENDANCE_STATUS } from "../constants";
import { ConfirmDialog } from "../components/ConfirmDialog";

// Yup validation schema
const attendanceValidationSchema = yup.object({
	employeeId: yup
		.number()
		.required("Employee is required")
		.positive("Employee ID must be positive"),
	employeeName: yup.string().required("Employee name is required"),
	date: yup
		.date()
		.required("Date is required")
		.max(new Date(), "Date cannot be in the future"),
	status: yup
		.string()
		.required("Status is required")
		.oneOf(ATTENDANCE_STATUS as unknown as string[], "Invalid status"),
	checkInTime: yup.string().when("status", {
		is: (val: string) => val === "Present" || val === "Half-Day",
		then: schema =>
			schema.required("Check-in time is required for Present/Half-Day status"),
		otherwise: schema => schema.notRequired(),
	}),
	checkOutTime: yup.string().notRequired(),
	workHours: yup
		.number()
		.min(0, "Work hours must be positive")
		.max(24, "Work hours cannot exceed 24")
		.notRequired(),
	isLate: yup.boolean().notRequired(),
	notes: yup.string().notRequired(),
});

interface AttendanceFormData {
	employeeId: number;
	employeeName: string;
	date: string;
	status: string;
	checkInTime: string;
	checkOutTime: string;
	workHours: string;
	isLate: boolean;
	notes: string;
}

const AttendancePage = () => {
	const {
		attendance,
		employees,
		loading,
		createAttendance,
		updateAttendanceRecord,
		removeAttendance,
	} = useAttendance();
	const [openDialog, setOpenDialog] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [selectedAttendance, setSelectedAttendance] =
		useState<IAttendance | null>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<IAttendance | null>(null);
	const [formData, setFormData] = useState<AttendanceFormData>({
		employeeId: 0,
		employeeName: "",
		date: new Date().toISOString().split("T")[0],
		status: "Present",
		checkInTime: "",
		checkOutTime: "",
		workHours: "",
		isLate: false,
		notes: "",
	});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

	const handleAddClick = () => {
		setEditMode(false);
		setSelectedAttendance(null);
		setFormData({
			employeeId: 0,
			employeeName: "",
			date: new Date().toISOString().split("T")[0],
			status: "Present",
			checkInTime: "",
			checkOutTime: "",
			workHours: "",
			isLate: false,
			notes: "",
		});
		setValidationErrors({});
		setOpenDialog(true);
	};

	const handleEditClick = (record: IAttendance) => {
		setEditMode(true);
		setSelectedAttendance(record);
		setFormData({
			employeeId: record.employeeId,
			employeeName: record.employeeName,
			date: new Date(record.date).toISOString().split("T")[0],
			status: record.status,
			checkInTime: record.checkInTime || "",
			checkOutTime: record.checkOutTime || "",
			workHours: record.workHours?.toString() || "",
			isLate: record.isLate || false,
			notes: record.notes || "",
		});
		setValidationErrors({});
		setOpenDialog(true);
	};

	const handleDeleteClick = (record: IAttendance) => {
		setDeleteTarget(record);
		setConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (deleteTarget) {
			try {
				await removeAttendance(deleteTarget.id);
				setConfirmDialogOpen(false);
				setDeleteTarget(null);
			} catch (error) {
				console.error("Failed to delete attendance:", error);
				alert("Failed to delete attendance record");
			}
		}
	};

	const handleCancelDelete = () => {
		setConfirmDialogOpen(false);
		setDeleteTarget(null);
	};

	const handleInputChange = (field: keyof AttendanceFormData, value: any) => {
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

	const handleEmployeeChange = (employeeId: number, employeeName: string) => {
		setFormData(prev => ({ ...prev, employeeId, employeeName }));
		if (validationErrors.employeeId || validationErrors.employeeName) {
			setValidationErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors.employeeId;
				delete newErrors.employeeName;
				return newErrors;
			});
		}
	};

	const handleSave = async () => {
		try {
			// Validate form data
			const dataToValidate = {
				...formData,
				date: new Date(formData.date),
				workHours: formData.workHours
					? parseFloat(formData.workHours)
					: undefined,
			};

			await attendanceValidationSchema.validate(dataToValidate, {
				abortEarly: false,
			});

			// Clear any previous validation errors
			setValidationErrors({});

			// Save data
			const saveData = {
				employeeId: formData.employeeId,
				employeeName: formData.employeeName,
				date: new Date(formData.date),
				status: formData.status as
					| "Present"
					| "Absent"
					| "Half-Day"
					| "Leave"
					| "Holiday",
				checkInTime: formData.checkInTime || undefined,
				checkOutTime: formData.checkOutTime || undefined,
				workHours: formData.workHours
					? parseFloat(formData.workHours)
					: undefined,
				isLate: formData.isLate,
				notes: formData.notes || undefined,
			};

			if (editMode && selectedAttendance) {
				await updateAttendanceRecord({
					...selectedAttendance,
					...saveData,
				});
			} else {
				await createAttendance(saveData as IAddAttendanceParams);
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
				console.error("Failed to save attendance:", error);
				alert("Failed to save attendance record");
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
			field: "employeeName",
			headerName: "Employee Name",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "date",
			headerName: "Date",
			flex: 1,
			minWidth: 120,
			valueFormatter: value => {
				if (!value) return "";
				return new Date(value).toLocaleDateString();
			},
		},
		{
			field: "status",
			headerName: "Status",
			flex: 0.8,
			minWidth: 120,
			renderCell: params => {
				const colorMap: Record<
					string,
					"default" | "success" | "error" | "warning" | "info"
				> = {
					Present: "success",
					Absent: "error",
					"Half-Day": "warning",
					Leave: "info",
					Holiday: "default",
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
			field: "checkInTime",
			headerName: "Check In",
			flex: 0.7,
			minWidth: 100,
		},
		{
			field: "checkOutTime",
			headerName: "Check Out",
			flex: 0.7,
			minWidth: 100,
		},
		{
			field: "workHours",
			headerName: "Work Hours",
			flex: 0.6,
			minWidth: 100,
			valueFormatter: value => (value ? `${value}h` : ""),
		},
		{
			field: "isLate",
			headerName: "Punctuality",
			flex: 0.7,
			minWidth: 100,
			renderCell: params => {
				const isLate = params.row.isLate;
				const status = params.row.status;

				if (status === "Absent" || status === "Leave" || status === "Holiday") {
					return null;
				}

				return (
					<Chip
						label={isLate ? "Late" : "On Time"}
						color={isLate ? "error" : "success"}
						size="small"
						sx={{ fontWeight: 600 }}
					/>
				);
			},
		},
		{
			field: "actions",
			type: "actions",
			headerName: "Actions",
			width: 100,
			getActions: (params: GridRowParams<IAttendance>) => [
				<GridActionsCellItem
					icon={<EditIcon color="primary" />}
					label="Edit"
					onClick={() => handleEditClick(params.row)}
				/>,
				<GridActionsCellItem
					icon={<DeleteIcon color="error" />}
					label="Delete"
					onClick={() => handleDeleteClick(params.row)}
				/>,
			],
		},
	];

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
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAddClick}
						sx={{ textTransform: "none" }}
					>
						Add Attendance
					</Button>
				</Box>
				<Box sx={{ flexGrow: 1, px: 2, pb: 2 }}>
					<DataGrid
						rows={attendance}
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
					{editMode ? "Edit Attendance Record" : "Add New Attendance Record"}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
						<Autocomplete
							options={employees}
							getOptionLabel={option => `${option.empName} (ID: ${option.id})`}
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
										validationErrors.employeeId || validationErrors.employeeName
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
								onChange={e => handleInputChange("checkInTime", e.target.value)}
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

			{/* Confirm Delete Dialog */}
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
		</Box>
	);
};

export default AttendancePage;
