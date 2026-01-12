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
import { IAttendance, IEmployee } from "../utils/api/types";
import {
	fetchAttendance,
	deleteAttendance,
	updateAttendance,
} from "../utils/api/services/attendance";
import { fetchEmployees } from "../utils/api/services/employees";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ATTENDANCE_STATUS } from "../constants";
import { attendanceValidationSchema } from "../forms/validationSchemas";
import * as yup from "yup";

const AttendanceDetail = () => {
	const { attendanceId } = useParams<{ attendanceId: string }>();
	const navigate = useNavigate();
	const [attendance, setAttendance] = useState<IAttendance | null>(null);
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [loading, setLoading] = useState(true);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState<any>({});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		const loadData = async () => {
			if (!attendanceId) return;

			try {
				setLoading(true);
				const [attendanceData, employeesData] = await Promise.all([
					fetchAttendance(),
					fetchEmployees(),
				]);
				const record = attendanceData.find(
					a => a.id.toString() === attendanceId
				);
				setAttendance(record || null);
				setEmployees(employeesData);

				if (record) {
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
				}
			} catch (error) {
				console.error("Failed to fetch attendance:", error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [attendanceId]);

	const handleBack = () => {
		navigate("/attendance");
	};

	const handleEdit = () => {
		setEditMode(true);
		setValidationErrors({});
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setValidationErrors({});
		// Reset form data to original attendance data
		if (attendance) {
			setFormData({
				employeeId: attendance.employeeId,
				employeeName: attendance.employeeName,
				date: new Date(attendance.date).toISOString().split("T")[0],
				status: attendance.status,
				checkInTime: attendance.checkInTime || "",
				checkOutTime: attendance.checkOutTime || "",
				workHours: attendance.workHours?.toString() || "",
				isLate: attendance.isLate || false,
				notes: attendance.notes || "",
			});
		}
	};

	const handleSave = async () => {
		if (!attendance) return;

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
				...attendance,
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

			await updateAttendance(saveData);

			// Update local state
			setAttendance(saveData);
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
				console.error("Failed to save attendance:", error);
				alert("Failed to save attendance record");
			}
		}
	};

	const handleDelete = () => {
		setConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!attendance) return;

		try {
			await deleteAttendance(attendance.id);
			setConfirmDialogOpen(false);
			navigate("/attendance");
		} catch (error) {
			console.error("Failed to delete attendance:", error);
			alert("Failed to delete attendance record");
		}
	};

	const handleCancelDelete = () => {
		setConfirmDialogOpen(false);
	};

	const handleInputChange = (field: string, value: any) => {
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

	const handleEmployeeChange = (employeeId: number, employeeName: string) => {
		setFormData((prev: any) => ({ ...prev, employeeId, employeeName }));
		if (validationErrors.employeeId || validationErrors.employeeName) {
			setValidationErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors.employeeId;
				delete newErrors.employeeName;
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

	if (!attendance) {
		return (
			<Box sx={{ p: 3 }}>
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6">Attendance record not found</Typography>
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
			"default" | "success" | "error" | "warning" | "info"
		> = {
			Present: "success",
			Absent: "error",
			"Half-Day": "warning",
			Leave: "info",
			Holiday: "default",
		};
		return colorMap[status] || "default";
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
						Attendance Details
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
								label="Employee"
								fullWidth
								value={`${formData.employeeName} (ID: ${formData.employeeId})`}
								disabled
							/>
						</Grid>

						<Grid>
							<TextField
								label="Date"
								type="date"
								fullWidth
								value={formData.date}
								onChange={e => handleInputChange("date", e.target.value)}
								error={!!validationErrors.date}
								helperText={validationErrors.date}
								InputLabelProps={{ shrink: true }}
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
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
							<TextField
								label="ID"
								fullWidth
								value={attendance.id}
								disabled
							/>
						</Grid>

						<Grid>
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
						</Grid>
					</Grid>
				) : (
					<Grid
						display={"grid"}
						gridTemplateColumns={"1fr 1fr"}
						container
						spacing={3}
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
								{attendance.id}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Employee
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{attendance.employeeName} (ID: {attendance.employeeId})
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Date
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{new Date(attendance.date).toLocaleDateString()}
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
								label={attendance.status}
								color={getStatusColor(attendance.status)}
								sx={{ fontWeight: 600 }}
							/>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Punctuality
							</Typography>
							{attendance.status === "Present" ||
							attendance.status === "Half-Day" ? (
								<Chip
									label={attendance.isLate ? "Late" : "On Time"}
									color={attendance.isLate ? "error" : "success"}
									sx={{ fontWeight: 600 }}
								/>
							) : (
								<Typography variant="body1">N/A</Typography>
							)}
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Check In Time
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{attendance.checkInTime || "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Check Out Time
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{attendance.checkOutTime || "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Work Hours
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{attendance.workHours ? `${attendance.workHours}h` : "N/A"}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Notes
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{attendance.notes || "No notes"}
							</Typography>
						</Grid>
					</Grid>
				)}
			</Paper>

			{confirmDialogOpen && (
				<ConfirmDialog
					open={confirmDialogOpen}
					onClose={handleCancelDelete}
					onConfirm={handleConfirmDelete}
					title="Delete Attendance Record"
					message={`Are you sure you want to delete the attendance record for ${attendance.employeeName} on ${new Date(attendance.date).toLocaleDateString()}? This action cannot be undone.`}
					confirmText="Delete"
					cancelText="Cancel"
					confirmColor="error"
				/>
			)}
		</Box>
	);
};

export default AttendanceDetail;
