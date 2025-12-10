export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: {
		id: number;
		email: string;
		name: string;
	};
}

// User profile response
export interface IEmployee {
	id: number | string;
	empId: string;
	empName: string;
	position: string;
	department: string;
	hireDate: Date;
	email: string;
	[key: string]: any;
	[key: symbol]: any;
}
export interface IAddEmployeeParams {
	empName: string;
	position: string;
	department: string;
	hireDate: Date;
	email: string;
}
