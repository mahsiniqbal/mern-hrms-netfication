import { useState, useEffect, useCallback } from "react";
import { IAttendance, IAddAttendanceParams, IEmployee } from "../../utils/api/types";
import {
	addAttendance,
	updateAttendance,
	deleteAttendance,
	fetchAttendance,
} from "../../utils/api/services/attendance";
import { fetchEmployees } from "../../utils/api/services/employees";

export const useAttendance = () => {
	const [attendance, setAttendance] = useState<IAttendance[]>([]);
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Fetch attendance and employees data
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
				setRefreshTrigger((prev) => prev + 1);
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
				setRefreshTrigger((prev) => prev + 1);
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
				setRefreshTrigger((prev) => prev + 1);
			} catch (err: any) {
				console.error("Failed to delete attendance:", err);
				throw err;
			}
		},
		[]
	);

	// Refresh data manually
	const refresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1);
	}, []);

	return {
		attendance,
		employees,
		loading,
		error,
		createAttendance,
		updateAttendanceRecord,
		removeAttendance,
		refresh,
	};
};
