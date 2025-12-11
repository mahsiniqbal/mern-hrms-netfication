export interface EmployeeFormData {
	empName: string;
	email: string;
	position: string;
	department: string;
	hireDate: string;
}
export interface AttendanceFormData {
	employeeId: number;
	employeeName: string;
	date: string;
	status: string;
	checkInTime: string;
	checkOutTime: string;
	workHours: string;
	isLate: boolean;
	notes: string;
}
export interface ProjectFormData {
	projectName: string;
	projectCode: string;
	description: string;
	clientName: string;
	startDate: string;
	endDate: string;
	status: string;
	priority: string;
	budget: string;
	totalHoursAllocated: string;
	teamSize: string;
	projectManager: string;
	progress: string;
}
