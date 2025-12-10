import { useEffect, useState } from "react";
import { IAddEmployeeParams, IEmployee } from "../../utils/api/types";
import {
	addEmployee,
	deleteEmployee,
	fetchEmployees,
	updateEmployees,
} from "../../utils/api/services/employees";
import { DataSource, DataSourceCache } from "@toolpad/core/Crud";
import { z } from "zod";
import { DEPARTMENTS } from "../../constants";

export const useEmployeesServices = () => {
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const employeesCache = new DataSourceCache();
	const departmentSchema = z.enum(DEPARTMENTS);

	const loadEmployees = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchEmployees();
			if (data) {
				setEmployees(data);
			}
		} catch (err: any) {
			setError("Failed to load employees");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		loadEmployees();
	}, []);

	const addNewEmployee = async (data: IAddEmployeeParams) => {
		try {
			const newEmp = await addEmployee(data);
			setEmployees(prev => [...prev, newEmp]);
		} catch (err) {
			console.error("Add employee failed:", err);
			throw err;
		}
	};

	const deleteEmployeeData = async (id: string) => {
		try {
			await deleteEmployee(id);
			setEmployees(prev => prev.filter(emp => emp.empId !== id));
		} catch (err) {
			console.error("Delete employee failed:", err);
			throw err;
		}
	};

	const EmployeesDataSource: DataSource<IEmployee> = {
		fields: [
			{
				field: "id",
				headerName: "Employee ID",
				flex: 1,
				align: "center",
				headerAlign: "center",
			},
			{ field: "empName", headerName: "Name", flex: 1 },
			{ field: "email", headerName: "Email", flex: 1 },
			{ field: "position", headerName: "Position", flex: 1, type: "string" },
			{
				field: "hireDate",
				headerName: "Join date",
				type: "date",
				flex: 1,
				valueGetter: value => value && new Date(value),
			},
			{
				field: "department",
				headerName: "Department",
				type: "singleSelect",
				flex: 1,
				valueOptions: [...DEPARTMENTS],
			},
		],
		getMany: async ({ paginationModel, filterModel, sortModel }) => {
			const employeesStore = employees;

			let filteredEmployees = [...employeesStore];

			// Apply filters (example only)
			if (filterModel?.items?.length) {
				filterModel.items.forEach(({ field, value, operator }) => {
					if (!field || value == null) {
						return;
					}

					filteredEmployees = filteredEmployees.filter(employee => {
						const employeeValue = employee[field];

						switch (operator) {
							case "contains":
								return String(employeeValue)
									.toLowerCase()
									.includes(String(value).toLowerCase());
							case "equals":
								return employeeValue === value;
							case "startsWith":
								return String(employeeValue)
									.toLowerCase()
									.startsWith(String(value).toLowerCase());
							case "endsWith":
								return String(employeeValue)
									.toLowerCase()
									.endsWith(String(value).toLowerCase());
							case ">":
								return (employeeValue as number) > value;
							case "<":
								return (employeeValue as number) < value;
							default:
								return true;
						}
					});
				});
			}

			// Apply sorting
			if (sortModel?.length) {
				filteredEmployees.sort((a, b) => {
					for (const { field, sort } of sortModel) {
						if ((a[field] as number) < (b[field] as number)) {
							return sort === "asc" ? -1 : 1;
						}
						if ((a[field] as number) > (b[field] as number)) {
							return sort === "asc" ? 1 : -1;
						}
					}
					return 0;
				});
			}

			// Apply pagination
			const start = paginationModel.page * paginationModel.pageSize;
			const end = start + paginationModel.pageSize;
			const paginatedEmployees = filteredEmployees.slice(start, end);

			return {
				items: paginatedEmployees,
				itemCount: filteredEmployees.length,
			};
		},
		getOne: async employeeId => {
			const employeesStore = employees;
			const employeeToShow = employeesStore.find(
				employee => employee.id === Number(employeeId)
			);

			if (!employeeToShow) {
				throw new Error("Employee not found");
			}
			return employeeToShow;
		},
		createOne: async data => {
			const newEmployee = {
				...data,
			} as IEmployee;
			await addEmployee({
				...newEmployee,
			});
			loadEmployees();

			return newEmployee;
		},
		updateOne: async (employeeId, data) => {
			console.log(employeeId, data);
			const employeesStore = employees;
			let updatedEmployee: IEmployee | null = null;
			setEmployees(
				employeesStore.map(employee => {
					if (employee.id === Number(employeeId)) {
						updatedEmployee = { ...employee, ...data };
						return updatedEmployee;
					}
					return employee;
				})
			);
			updatedEmployee && updateEmployees(updatedEmployee);

			if (!updatedEmployee) {
				throw new Error("Employee not found");
			}
			return updatedEmployee;
		},
		deleteOne: async employeeId => {
			const employeesStore = employees;
			deleteEmployee(employeeId);
			setEmployees(
				employeesStore.filter(employee => employee.id !== Number(employeeId))
			);
		},

		validate: z.object({
			empName: z
				.string({ required_error: "Name is required" })
				.nonempty("Name is required"),
			position: z.string({ required_error: "Age is required" }),
			hireDate: z
				.string({ required_error: "Join date is required" })
				.nonempty("Join date is required"),
			department: departmentSchema.refine(val => DEPARTMENTS.includes(val), {
				message: `Department must be one of: ${DEPARTMENTS.join(", ")}`,
			}),
			email: z
				.string({ required_error: "Email is required" })
				.nonempty("Email is required")
				.email("Invalid email address"),
		})["~standard"].validate,
	};

	return {
		employees,
		loading,
		error,
		addEmployee: addNewEmployee,
		deleteEmployee: deleteEmployeeData,
		EmployeesDataSource,
		employeesCache,
	};
};
