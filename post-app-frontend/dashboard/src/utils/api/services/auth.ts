import axios from "../axios";
import API from "../endpoints";
import { LoginRequest, LoginResponse, ChangePasswordRequest, IUser } from "../types";

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
	const response = await axios.post<LoginResponse>(API.LOGIN, {
		email,
		password,
	} as LoginRequest);
	return response.data;
};

export const changePassword = async (
	oldPassword: string,
	newPassword: string
): Promise<void> => {
	await axios.post(API.CHANGE_PASSWORD, {
		oldPassword,
		newPassword,
	} as ChangePasswordRequest);
};

export const getCurrentUser = async (): Promise<IUser> => {
	const response = await axios.get<IUser>(API.ME);
	return response.data;
};
