import axiosInstance from "../axios";
import API from "../endpoints";
import {
	IAttendance,
	IAddAttendanceParams,
	IAttendanceStats,
	IAttendanceTrend,
} from "../types";

export const fetchAttendance = async (params?: {
	employeeId?: number;
	startDate?: string;
	endDate?: string;
	status?: string;
}): Promise<IAttendance[]> => {
	const queryParams = new URLSearchParams();
	if (params?.employeeId)
		queryParams.append("employeeId", params.employeeId.toString());
	if (params?.startDate) queryParams.append("startDate", params.startDate);
	if (params?.endDate) queryParams.append("endDate", params.endDate);
	if (params?.status) queryParams.append("status", params.status);

	const url = queryParams.toString()
		? `${API.ATTENDANCE}?${queryParams.toString()}`
		: API.ATTENDANCE;

	const response = await axiosInstance.get<IAttendance[]>(url);
	return response.data;
};

export const fetchAttendanceById = async (
	id: string | number
): Promise<IAttendance> => {
	const response = await axiosInstance.get<IAttendance>(
		`${API.ATTENDANCE}/${id}`
	);
	return response.data;
};

export const addAttendance = async (
	data: IAddAttendanceParams
): Promise<IAttendance> => {
	const response = await axiosInstance.post<IAttendance>(API.ATTENDANCE, data);
	return response.data;
};

export const updateAttendance = async (
	data: IAttendance
): Promise<IAttendance> => {
	if (!data.id) throw new Error("Attendance ID is required");

	const response = await axiosInstance.put<IAttendance>(
		`${API.ATTENDANCE}/${data.id}`,
		data
	);
	return response.data;
};

export const deleteAttendance = async (
	id: string | number
): Promise<{ message: string }> => {
	const response = await axiosInstance.delete<{ message: string }>(
		`${API.ATTENDANCE}/${id}`
	);
	return response.data;
};

export const fetchAttendanceStats = async (params: {
	employeeId?: number;
	period: "week" | "month" | "year";
	year?: number;
	month?: number;
}): Promise<IAttendanceStats[]> => {
	const queryParams = new URLSearchParams();
	if (params.employeeId)
		queryParams.append("employeeId", params.employeeId.toString());
	queryParams.append("period", params.period);
	if (params.year) queryParams.append("year", params.year.toString());
	if (params.month) queryParams.append("month", params.month.toString());

	const response = await axiosInstance.get<IAttendanceStats[]>(
		`${API.ATTENDANCE}/stats/summary?${queryParams.toString()}`
	);
	return response.data;
};

export const fetchAttendanceTrends = async (params: {
	employeeId?: number;
	period: "week" | "month" | "year";
	year?: number;
	month?: number;
}): Promise<IAttendanceTrend[]> => {
	const queryParams = new URLSearchParams();
	if (params.employeeId)
		queryParams.append("employeeId", params.employeeId.toString());
	queryParams.append("period", params.period);
	if (params.year) queryParams.append("year", params.year.toString());
	if (params.month) queryParams.append("month", params.month.toString());

	const response = await axiosInstance.get<IAttendanceTrend[]>(
		`${API.ATTENDANCE}/stats/trends?${queryParams.toString()}`
	);
	return response.data;
};
