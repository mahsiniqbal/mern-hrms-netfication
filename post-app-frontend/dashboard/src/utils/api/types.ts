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
