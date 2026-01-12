import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	Box,
	Paper,
	Typography,
	Button,
	CircularProgress,
	Grid,
	Divider,
	IconButton,
	Avatar,
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
import { IEmployee } from "../utils/api/types";
import {
	fetchEmployees,
	deleteEmployee,
	updateEmployees,
} from "../utils/api/services/employees";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DEPARTMENTS } from "../constants";
import { employeeValidationSchema } from "../forms/validationSchemas";
import * as yup from "yup";

const EmployeeDetail = () => {
	const { employeeId } = useParams<{ employeeId: string }>();
	const navigate = useNavigate();
	const [employee, setEmployee] = useState<IEmployee | null>(null);
	const [loading, setLoading] = useState(true);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState<any>({});
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		const loadEmployee = async () => {
			if (!employeeId) return;

			try {
				setLoading(true);
				const data = await fetchEmployees();
				const record = data.find(e => e.id.toString() === employeeId);
				setEmployee(record || null);

				if (record) {
					setFormData({
						empName: record.empName,
						email: record.email,
						position: record.position,
						department: record.department,
						hireDate: new Date(record.hireDate).toISOString().split("T")[0],
					});
				}
			} catch (error) {
				console.error("Failed to fetch employee:", error);
			} finally {
				setLoading(false);
			}
		};

		loadEmployee();
	}, [employeeId]);

	const handleBack = () => {
		navigate("/employees");
	};

	const handleEdit = () => {
		setEditMode(true);
		setValidationErrors({});
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setValidationErrors({});
		// Reset form data to original employee data
		if (employee) {
			setFormData({
				empName: employee.empName,
				email: employee.email,
				position: employee.position,
				department: employee.department,
				hireDate: new Date(employee.hireDate).toISOString().split("T")[0],
			});
		}
	};

	const handleSave = async () => {
		if (!employee) return;

		try {
			// Validate form data
			await employeeValidationSchema.validate(
				{
					...formData,
					hireDate: new Date(formData.hireDate),
				},
				{ abortEarly: false }
			);

			// Clear any previous validation errors
			setValidationErrors({});

			// Save data
			const saveData = {
				...employee,
				empName: formData.empName,
				email: formData.email,
				position: formData.position,
				department: formData.department,
				hireDate: new Date(formData.hireDate),
			};

			await updateEmployees(saveData);

			// Update local state
			setEmployee(saveData);
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
				console.error("Failed to save employee:", error);
				alert("Failed to save employee");
			}
		}
	};

	const handleDelete = () => {
		setConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!employee) return;

		try {
			await deleteEmployee(employee.id);
			setConfirmDialogOpen(false);
			navigate("/employees");
		} catch (error) {
			console.error("Failed to delete employee:", error);
			alert("Failed to delete employee");
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

	if (!employee) {
		return (
			<Box sx={{ p: 3 }}>
				<Paper sx={{ p: 3 }}>
					<Typography variant="h6">Employee not found</Typography>
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
						Employee Details
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

				<Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
					<Avatar
						sx={{
							width: 80,
							height: 80,
							mr: 3,
							bgcolor: "primary.main",
							fontSize: "2rem",
						}}
					>
						{employee.empName.charAt(0).toUpperCase()}
					</Avatar>
					<Box
						display={"flex"}
						gap={2}
						alignItems={"center"}
					>
						{editMode ? (
							<TextField
								label="Name"
								value={formData.empName}
								onChange={e => handleInputChange("empName", e.target.value)}
								error={!!validationErrors.empName}
								helperText={validationErrors.empName}
								sx={{ mb: 1 }}
								disabled
							/>
						) : (
							<Typography
								variant="h4"
								gutterBottom
							>
								{employee.empName}
							</Typography>
						)}
						{editMode ? (
							<TextField
								label="Position"
								value={formData.position}
								onChange={e => handleInputChange("position", e.target.value)}
								error={!!validationErrors.position}
								helperText={validationErrors.position}
							/>
						) : (
							<Typography
								variant="body1"
								color="text.secondary"
							>
								{employee.position}
							</Typography>
						)}
					</Box>
				</Box>

				{editMode ? (
					<Grid
						display={"grid"}
						gridTemplateColumns={"1fr 1fr"}
						container
						spacing={2}
					>
						<Grid>
							<TextField
								label="Employee ID"
								fullWidth
								value={employee.id}
								disabled
							/>
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
							<TextField
								label="Position"
								fullWidth
								value={formData.position}
								onChange={e => handleInputChange("position", e.target.value)}
								error={!!validationErrors.position}
								helperText={validationErrors.position}
								required
							/>
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
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
						</Grid>

						<Grid>
							<TextField
								label="Year(s) with Company"
								fullWidth
								value={`${Math.floor(
									(new Date().getTime() -
										new Date(employee.hireDate).getTime()) /
										(1000 * 60 * 60 * 24 * 365)
								)} year(s)`}
								disabled
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
								Employee ID
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{employee.id}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Email
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{employee.email}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Position
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{employee.position}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Department
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{employee.department}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Hire Date
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{new Date(employee.hireDate).toLocaleDateString()}
							</Typography>
						</Grid>

						<Grid>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Year(s) with Company
							</Typography>
							<Typography
								variant="body1"
								sx={{ mb: 2 }}
							>
								{Math.floor(
									(new Date().getTime() -
										new Date(employee.hireDate).getTime()) /
										(1000 * 60 * 60 * 24 * 365)
								)}{" "}
								year(s)
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
					title="Delete Employee"
					message={`Are you sure you want to delete ${employee.empName}? This action cannot be undone.`}
					confirmText="Delete"
					cancelText="Cancel"
					confirmColor="error"
				/>
			)}
		</Box>
	);
};

export default EmployeeDetail;
