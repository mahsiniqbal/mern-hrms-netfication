import React, { useState, useEffect, useCallback } from "react";
import { IEmployee, IAddEmployeeParams } from "../../utils/api/types";
import {
	addEmployee,
	updateEmployees,
	deleteEmployee,
	fetchEmployees,
} from "../../utils/api/services/employees";
import { EmployeeFormData } from "../../types/types";
import * as yup from "yup";
import { employeeValidationSchema } from "../../forms/validationSchemas";
import { GridColDef, GridActionsCellItem, GridRowParams } from "@mui/x-data-grid";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

export const useEmployees = () => {
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [openDialog, setOpenDialog] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
		null
	);
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<IEmployee | null>(null);

	const [formData, setFormData] = useState<EmployeeFormData>({
		empName: "",
		email: "",
		position: "",
		department: "",
		hireDate: new Date().toISOString().split("T")[0],
	});

	// Fetch employees data
	useEffect(() => {
		const loadEmployees = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchEmployees();
				setEmployees(data);
			} catch (err: any) {
				setError(err.message || "Failed to fetch employees");
				console.error("Failed to fetch employees:", err);
			} finally {
				setLoading(false);
			}
		};
		loadEmployees();
	}, [refreshTrigger]);

	// Create new employee
	const createEmployee = useCallback(
		async (data: IAddEmployeeParams): Promise<void> => {
			try {
				await addEmployee(data);
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to create employee:", err);
				throw err;
			}
		},
		[]
	);

	// Update existing employee
	const updateEmployee = useCallback(
		async (employee: IEmployee): Promise<void> => {
			try {
				await updateEmployees(employee);
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to update employee:", err);
				throw err;
			}
		},
		[]
	);

	// Delete employee
	const removeEmployee = useCallback(
		async (id: string | number): Promise<void> => {
			try {
				await deleteEmployee(id);
				setRefreshTrigger(prev => prev + 1);
			} catch (err: any) {
				console.error("Failed to delete employee:", err);
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
		setSelectedEmployee(null);
		setFormData({
			empName: "",
			email: "",
			position: "",
			department: "",
			hireDate: new Date().toISOString().split("T")[0],
		});
		setValidationErrors({});
		setOpenDialog(true);
	};

	const handleEditClick = (employee: IEmployee) => {
		setEditMode(true);
		setSelectedEmployee(employee);
		setFormData({
			empName: employee.empName,
			email: employee.email,
			position: employee.position,
			department: employee.department,
			hireDate: new Date(employee.hireDate).toISOString().split("T")[0],
		});
		setValidationErrors({});
		setOpenDialog(true);
	};

	const handleDeleteClick = (employee: IEmployee) => {
		setDeleteTarget(employee);
		setConfirmDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (deleteTarget) {
			try {
				await removeEmployee(deleteTarget.id);
				setConfirmDialogOpen(false);
				setDeleteTarget(null);
			} catch (error) {
				console.error("Failed to delete employee:", error);
				alert("Failed to delete employee");
			}
		}
	};

	const handleCancelDelete = () => {
		setConfirmDialogOpen(false);
		setDeleteTarget(null);
	};

	const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
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
			if (editMode && selectedEmployee) {
				await updateEmployee({
					...selectedEmployee,
					...formData,
					hireDate: new Date(formData.hireDate),
				});
			} else {
				await createEmployee({
					...formData,
					hireDate: new Date(formData.hireDate),
				} as IAddEmployeeParams);
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
				console.error("Failed to save employee:", error);
				alert("Failed to save employee");
			}
		}
	};
	const columns: GridColDef[] = [
		{
			field: "id",
			headerName: "ID",
			width: 80,
			align: "center",
			headerAlign: "center",
		},
		{
			field: "empName",
			headerName: "Name",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "email",
			headerName: "Email",
			flex: 1,
			minWidth: 200,
		},
		{
			field: "position",
			headerName: "Position",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "department",
			headerName: "Department",
			flex: 1,
			minWidth: 150,
		},
		{
			field: "hireDate",
			headerName: "Hire Date",
			flex: 1,
			minWidth: 120,
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
			getActions: (params: GridRowParams<IEmployee>) => [
				<GridActionsCellItem
					key="edit"
					icon={<EditIcon color="primary" />}
					label="Edit"
					onClick={() => handleEditClick(params.row)}
				/>,
				<GridActionsCellItem
					key="delete"
					icon={<DeleteIcon color="error" />}
					label="Delete"
					onClick={() => handleDeleteClick(params.row)}
				/>,
			],
		},
	];

	return {
		employees,
		loading,
		error,
		createEmployee,
		updateEmployee,
		removeEmployee,
		refresh,
		openDialog,
		setOpenDialog,
		selectedEmployee,
		setSelectedEmployee,
		editMode,
		setEditMode,
		formData,
		setFormData,
		handleAddClick,
		handleEditClick,
		handleDeleteClick,
		columns,
		handleInputChange,
		handleSave,
		confirmDialogOpen,
		handleConfirmDelete,
		handleCancelDelete,
		deleteTarget,
	};
};
