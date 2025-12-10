import { useEffect, useState } from "react";
import {
	IAddAttendanceParams,
	IAttendance,
	IEmployee,
} from "../../utils/api/types";
import {
	addAttendance,
	deleteAttendance,
	fetchAttendance,
	updateAttendance,
} from "../../utils/api/services/attendance";
import { DataSource, DataSourceCache } from "@toolpad/core/Crud";
import { z } from "zod";
import { ATTENDANCE_STATUS } from "../../constants";
import { Chip } from "@mui/material";

export const useAttendanceServices = (employees: IEmployee[]) => {
	const [attendance, setAttendance] = useState<IAttendance[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const attendanceCache = new DataSourceCache();
	const statusSchema = z.enum(ATTENDANCE_STATUS);

	const loadAttendance = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchAttendance();
			if (data) {
				setAttendance(data);
			}
		} catch (err: any) {
			setError("Failed to load attendance");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAttendance();
	}, []);

	const addNewAttendance = async (data: IAddAttendanceParams) => {
		try {
			const newAttendance = await addAttendance(data);
			setAttendance(prev => [...prev, newAttendance]);
		} catch (err) {
			console.error("Add attendance failed:", err);
			throw err;
		}
	};

	const deleteAttendanceData = async (id: string) => {
		try {
			await deleteAttendance(id);
			setAttendance(prev => prev.filter(att => att.attendanceId !== id));
		} catch (err) {
			console.error("Delete attendance failed:", err);
			throw err;
		}
	};

	const AttendanceDataSource: DataSource<IAttendance> = {
		fields: [
			{
				field: "id",
				headerName: "ID",
				flex: 0.5,
				align: "center",
				headerAlign: "center",
				editable: false,
			},
			{
				field: "employeeId",
				headerName: "Employee ID",
				type: "number",
				flex: 0.8,
				align: "center",
				headerAlign: "center",
				editable: false,
			},
			{
				field: "employeeName",
				headerName: "Employee Name",
				flex: 1.2,
				editable: false,
			},
			{
				field: "date",
				headerName: "Date",
				type: "date",
				flex: 1,
				valueGetter: value => value && new Date(value),
			},
			{
				field: "status",
				headerName: "Status",
				type: "singleSelect",
				flex: 1,
				valueOptions: [...ATTENDANCE_STATUS],
			},
			{
				field: "checkInTime",
				headerName: "Check In",
				flex: 0.8,
			},
			{
				field: "checkOutTime",
				headerName: "Check Out",
				flex: 0.8,
			},
			{
				field: "workHours",
				headerName: "Work Hours",
				type: "number",
				flex: 0.8,
			},
			{
				field: "isLate",
				headerName: "Punctuality",
				flex: 0.9,
				type: "custom",
				renderCell: (params: any) => {
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
				field: "notes",
				headerName: "Notes",
				flex: 1.2,
			},
		],
		getMany: async ({ paginationModel, filterModel, sortModel }) => {
			const attendanceStore = attendance;

			let filteredAttendance = [...attendanceStore];

			// Apply filters
			if (filterModel?.items?.length) {
				filterModel.items.forEach(({ field, value, operator }) => {
					if (!field || value == null) {
						return;
					}

					filteredAttendance = filteredAttendance.filter(record => {
						const recordValue = record[field];

						switch (operator) {
							case "contains":
								return String(recordValue)
									.toLowerCase()
									.includes(String(value).toLowerCase());
							case "equals":
								return recordValue === value;
							case "startsWith":
								return String(recordValue)
									.toLowerCase()
									.startsWith(String(value).toLowerCase());
							case "endsWith":
								return String(recordValue)
									.toLowerCase()
									.endsWith(String(value).toLowerCase());
							case ">":
								return (recordValue as number) > value;
							case "<":
								return (recordValue as number) < value;
							default:
								return true;
						}
					});
				});
			}

			// Apply sorting
			if (sortModel?.length) {
				filteredAttendance.sort((a, b) => {
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
			const paginatedAttendance = filteredAttendance.slice(start, end);

			return {
				items: paginatedAttendance,
				itemCount: filteredAttendance.length,
			};
		},
		getOne: async attendanceId => {
			const attendanceStore = attendance;
			const attendanceToShow = attendanceStore.find(
				record => record.id === Number(attendanceId)
			);

			if (!attendanceToShow) {
				throw new Error("Attendance record not found");
			}
			return attendanceToShow;
		},
		createOne: async data => {
			const newAttendance = {
				...data,
			} as IAttendance;
			await addAttendance({
				...newAttendance,
			});
			loadAttendance();

			return newAttendance;
		},
		updateOne: async (attendanceId, data) => {
			const attendanceStore = attendance;
			let updatedAttendance: IAttendance | null = null;
			setAttendance(
				attendanceStore.map(record => {
					if (record.id === Number(attendanceId)) {
						updatedAttendance = { ...record, ...data };
						return updatedAttendance;
					}
					return record;
				})
			);
			updatedAttendance && updateAttendance(updatedAttendance);

			if (!updatedAttendance) {
				throw new Error("Attendance record not found");
			}
			return updatedAttendance;
		},
		deleteOne: async attendanceId => {
			const attendanceStore = attendance;
			deleteAttendance(attendanceId);
			setAttendance(
				attendanceStore.filter(record => record.id !== Number(attendanceId))
			);
		},

		validate: z
			.object({
				employeeId: z.coerce
					.number({ required_error: "Employee ID is required" })
					.int("Employee ID must be a whole number")
					.positive("Employee ID must be positive"),
				employeeName: z
					.string({ required_error: "Employee Name is required" })
					.nonempty("Employee Name is required"),
				date: z.union([
					z.date(),
					z
						.string({ required_error: "Date is required" })
						.nonempty("Date is required")
						.transform(str => new Date(str)),
				]),
				status: statusSchema.refine(val => ATTENDANCE_STATUS.includes(val), {
					message: `Status must be one of: ${ATTENDANCE_STATUS.join(", ")}`,
				}),
				checkInTime: z.string().optional(),
				checkOutTime: z.string().optional(),
				workHours: z.coerce.number().optional(),
				isLate: z.boolean().optional(),
				notes: z.string().optional(),
			})
			.passthrough()["~standard"].validate,
	};

	return {
		attendance,
		loading,
		error,
		addAttendance: addNewAttendance,
		deleteAttendance: deleteAttendanceData,
		AttendanceDataSource,
		attendanceCache,
		loadAttendance,
	};
};
