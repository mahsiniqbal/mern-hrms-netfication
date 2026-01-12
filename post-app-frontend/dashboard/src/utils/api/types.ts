// Auth interfaces
export interface LoginRequest {
	email: string;
	password: string;
}

export interface IUser {
	id: number;
	email: string;
	empName: string;
	role: 'admin' | 'user';
	isFirstLogin: boolean;
}

export interface LoginResponse {
	token: string;
	user: IUser;
}

export interface ChangePasswordRequest {
	oldPassword: string;
	newPassword: string;
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

// Attendance interfaces
export interface IAttendance {
	id: number | string;
	attendanceId: string;
	employeeId: number;
	employeeName: string;
	date: Date;
	status: "Present" | "Absent" | "Half-Day" | "Leave" | "Holiday";
	checkInTime?: string;
	checkOutTime?: string;
	workHours?: number;
	isLate?: boolean;
	notes?: string;
	[key: string]: any;
	[key: symbol]: any;
}

export interface IAddAttendanceParams {
	employeeId: number;
	employeeName: string;
	date: Date;
	status: "Present" | "Absent" | "Half-Day" | "Leave" | "Holiday";
	checkInTime?: string;
	checkOutTime?: string;
	workHours?: number;
	isLate?: boolean;
	notes?: string;
}

export interface IAttendanceStats {
	_id: number;
	employeeName: string;
	totalDays: number;
	presentDays: number;
	absentDays: number;
	halfDays: number;
	leaveDays: number;
	totalWorkHours: number;
	attendancePercentage: number;
}

export interface IAttendanceTrend {
	_id: number;
	present: number;
	absent: number;
	halfDay: number;
	leave: number;
	late: number;
}

// Project interfaces
export interface IProject {
	id: number | string;
	projectId: string;
	projectName: string;
	projectCode: string;
	description?: string;
	clientName?: string;
	startDate: Date;
	endDate?: Date;
	status: "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
	budget?: number;
	totalHoursAllocated?: number;
	totalHoursWorked?: number;
	teamSize?: number;
	projectManager?: string;
	priority: "Low" | "Medium" | "High" | "Critical";
	progress?: number;
	[key: string]: any;
	[key: symbol]: any;
}

export interface IAddProjectParams {
	projectName: string;
	projectCode: string;
	description?: string;
	clientName?: string;
	startDate: Date;
	endDate?: Date;
	status: "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
	budget?: number;
	totalHoursAllocated?: number;
	teamSize?: number;
	projectManager?: string;
	priority: "Low" | "Medium" | "High" | "Critical";
	progress?: number;
}

export interface IProjectWorkLog {
	id: number | string;
	workLogId: string;
	projectId: number;
	projectName: string;
	employeeId: number;
	employeeName: string;
	date: Date;
	hoursWorked: number;
	taskDescription?: string;
	notes?: string;
	[key: string]: any;
	[key: symbol]: any;
}

export interface IAddProjectWorkLogParams {
	projectId: number;
	projectName: string;
	employeeId: number;
	employeeName: string;
	date: Date;
	hoursWorked: number;
	taskDescription?: string;
	notes?: string;
}

export interface IProjectStats {
	_id: number;
	projectName: string;
	projectCode: string;
	status: string;
	priority: string;
	progress: number;
	budget?: number;
	totalHoursAllocated?: number;
	totalHoursWorked: number;
	startDate: Date;
	endDate?: Date;
}

export interface IProjectTrend {
	_id: number;
	totalHours: number;
	logCount: number;
}

export interface IEmployeeWorkRate {
	_id: number;
	employeeName: string;
	totalHours: number;
	logCount: number;
	workRatePercentage: string;
}
