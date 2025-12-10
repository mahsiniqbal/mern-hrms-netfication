import axiosInstance from "../axios";
import API from "../endpoints";
import {
	LoginRequest,
	LoginResponse,
	IEmployee,
	IAddEmployeeParams,
} from "../types";

export const loginUser = async (
	credentials: LoginRequest
): Promise<LoginResponse> => {
	const response = await axiosInstance.post<LoginResponse>(
		API.LOGIN,
		credentials
	);
	return response.data;
};

export const fetchEmployees = async (): Promise<IEmployee[]> => {
	const response = await axiosInstance.get<IEmployee[]>(API.EMPLOYESS);
	return response.data;
};
export const updateEmployees = async (data: IEmployee): Promise<IEmployee> => {
	if (!data._id && !data.id) throw new Error("Employee ID is required");

	const id = data.id;

	const response = await axiosInstance.put<IEmployee>(
		`${API.EMPLOYESS}/${id}`,
		data
	);
	return response.data;
};

export const addEmployee = async (
	data: IAddEmployeeParams
): Promise<IEmployee> => {
	const response = await axiosInstance.post<IEmployee>(API.EMPLOYESS, data);
	return response.data;
};
export const deleteEmployee = async (
	id: string | number
): Promise<IEmployee> => {
	const response = await axiosInstance.delete<IEmployee>(
		`${API.EMPLOYESS}/${id}`
	);
	return response.data;
};
