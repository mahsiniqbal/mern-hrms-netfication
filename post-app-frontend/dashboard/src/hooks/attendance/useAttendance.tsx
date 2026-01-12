import { useState, useEffect, useCallback } from "react";
import {
	IAttendance,
	IAddAttendanceParams,
	IEmployee,
} from "../../utils/api/types";
import {
	addAttendance,
	updateAttendance,
	deleteAttendance,
	fetchAttendance,
} from "../../utils/api/services/attendance";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { fetchEmployees } from "../../utils/api/services/employees";
import {
	GridColDef,
	GridActionsCellItem,
	GridRowParams,
} from "@mui/x-data-grid";
import { Chip } from "@mui/material";
import { AttendanceFormData } from "../../types/types";
import { attendanceValidationSchema } from "../../forms/validationSchemas";
import * as yup from "yup";

interface UseAttendanceProps {
	isAdmin?: boolean;
}

export const useAttendance = (props?: UseAttendanceProps) => {
	const { isAdmin = false } = props || {};
	const [attendance, setAttendance] = useState<IAttendance[]>([]);
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
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

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);
			try {
				const [employeesData, attendanceData] = await Promise.all([
					fetchEmployees(),
					fetchAttendance(),
				]);
				setEmployees(employeesData);
				setAttendance(attendanceData);
			} catch (err: any) {
				setError(err.message || "Failed to fetch data");
				console.error("Failed to fetch data:", err);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [refreshTrigger]);

	// Create new attendance record
	const createAttendance = useCallback(
		async (data: IAddAttendanceParams): Promise<void> => {
			try {
				await addAttendance(data);
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to create attendance:", err);
				throw err;
			}
		},
		[]
	);

	// Update existing attendance record
	const updateAttendanceRecord = useCallback(
		async (record: IAttendance): Promise<void> => {
			try {
				await updateAttendance(record);
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to update attendance:", err);
				throw err;
			}
		},
		[]
	);

	// Delete attendance record
	const removeAttendance = useCallback(
		async (id: string | number): Promise<void> => {
			try {
				await deleteAttendance(id);
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to delete attendance:", err);
				throw err;
			}
		},
		[]
	);
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

	// Refresh data manually
	const refresh = useCallback(() => {
		setRefreshTrigger(prev => prev + 1);
	}, []);

	const baseColumns: GridColDef[] = [
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
	];

	const actionsColumn: GridColDef = {
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
	};

	const columns = isAdmin ? [...baseColumns, actionsColumn] : baseColumns;
	return {
		attendance,
		employees,
		loading,
		handleAddClick,
		handleSave,
		confirmDialogOpen,
		setConfirmDialogOpen,
		editMode,
		setEditMode,
		deleteTarget,
		handleInputChange,
		validationErrors,
		formData,
		setFormData,
		columns,
		openDialog,
		setOpenDialog,
		handleEmployeeChange,
		handleCancelDelete,
		handleConfirmDelete,
	};
};
