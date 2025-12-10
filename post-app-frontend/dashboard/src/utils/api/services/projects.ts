import axios from "../axios";
import API from "../endpoints";
import {
	IProject,
	IAddProjectParams,
	IProjectStats,
	IProjectTrend,
	IEmployeeWorkRate,
	IProjectWorkLog,
	IAddProjectWorkLogParams,
} from "../types";

// Projects
export const fetchProjects = async (): Promise<IProject[]> => {
	const response = await axios.get(API.PROJECTS);
	return response.data;
};

export const fetchProject = async (id: string | number): Promise<IProject> => {
	const response = await axios.get(`${API.PROJECTS}/${id}`);
	return response.data;
};

export const addProject = async (
	data: IAddProjectParams
): Promise<IProject> => {
	const response = await axios.post(API.PROJECTS, data);
	return response.data;
};

export const updateProject = async (data: IProject): Promise<IProject> => {
	const response = await axios.put(`${API.PROJECTS}/${data.id}`, data);
	return response.data;
};

export const deleteProject = async (id: string | number): Promise<void> => {
	await axios.delete(`${API.PROJECTS}/${id}`);
};

// Project Statistics
export const fetchProjectStats = async (params: {
	projectId?: number | "all";
	year?: number;
	month?: number;
}): Promise<IProjectStats[]> => {
	const response = await axios.get(`${API.PROJECTS}/stats/summary`, {
		params,
	});
	return response.data;
};

export const fetchProjectTrends = async (params: {
	projectId?: number | "all";
	period: "week" | "month" | "year";
	year?: number;
	month?: number;
}): Promise<IProjectTrend[]> => {
	const response = await axios.get(`${API.PROJECTS}/stats/trends`, { params });
	return response.data;
};

export const fetchEmployeeWorkRate = async (params: {
	projectId?: number | "all";
	year?: number;
	month?: number;
}): Promise<IEmployeeWorkRate[]> => {
	const response = await axios.get(
		`${API.PROJECTS}/stats/employee-work-rate`,
		{ params }
	);
	return response.data;
};

// Project Work Logs
export const fetchProjectWorkLogs = async (params?: {
	projectId?: number;
	employeeId?: number;
	startDate?: string;
	endDate?: string;
}): Promise<IProjectWorkLog[]> => {
	const response = await axios.get(API.PROJECT_WORK_LOGS, { params });
	return response.data;
};

export const fetchProjectWorkLog = async (
	id: string | number
): Promise<IProjectWorkLog> => {
	const response = await axios.get(`${API.PROJECT_WORK_LOGS}/${id}`);
	return response.data;
};

export const addProjectWorkLog = async (
	data: IAddProjectWorkLogParams
): Promise<IProjectWorkLog> => {
	const response = await axios.post(API.PROJECT_WORK_LOGS, data);
	return response.data;
};

export const updateProjectWorkLog = async (
	data: IProjectWorkLog
): Promise<IProjectWorkLog> => {
	const response = await axios.put(
		`${API.PROJECT_WORK_LOGS}/${data.id}`,
		data
	);
	return response.data;
};

export const deleteProjectWorkLog = async (
	id: string | number
): Promise<void> => {
	await axios.delete(`${API.PROJECT_WORK_LOGS}/${id}`);
};
