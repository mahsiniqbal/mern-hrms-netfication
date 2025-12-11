import * as yup from "yup";
import {
	ATTENDANCE_STATUS,
	DEPARTMENTS,
	PROJECT_PRIORITY,
	PROJECT_STATUS,
} from "../constants";

export const employeeValidationSchema = yup.object({
	empName: yup
		.string()
		.required("Name is required")
		.min(2, "Name must be at least 2 characters"),
	email: yup
		.string()
		.required("Email is required")
		.email("Invalid email address"),
	position: yup.string().required("Position is required"),
	department: yup
		.string()
		.required("Department is required")
		.oneOf(DEPARTMENTS as unknown as string[], "Invalid department"),
	hireDate: yup
		.date()
		.required("Hire date is required")
		.max(new Date(), "Hire date cannot be in the future"),
});
export const attendanceValidationSchema = yup.object({
	employeeId: yup
		.number()
		.required("Employee is required")
		.positive("Employee ID must be positive"),
	employeeName: yup.string().required("Employee name is required"),
	date: yup
		.date()
		.required("Date is required")
		.max(new Date(), "Date cannot be in the future"),
	status: yup
		.string()
		.required("Status is required")
		.oneOf(ATTENDANCE_STATUS as unknown as string[], "Invalid status"),
	checkInTime: yup.string().when("status", {
		is: (val: string) => val === "Present" || val === "Half-Day",
		then: schema =>
			schema.required("Check-in time is required for Present/Half-Day status"),
		otherwise: schema => schema.notRequired(),
	}),
	checkOutTime: yup.string().notRequired(),
	workHours: yup
		.number()
		.min(0, "Work hours must be positive")
		.max(24, "Work hours cannot exceed 24")
		.notRequired(),
	isLate: yup.boolean().notRequired(),
	notes: yup.string().notRequired(),
});

export const projectValidationSchema = yup.object({
	projectName: yup
		.string()
		.required("Project name is required")
		.min(2, "Project name must be at least 2 characters"),
	projectCode: yup
		.string()
		.required("Project code is required")
		.min(2, "Project code must be at least 2 characters"),
	description: yup.string().notRequired(),
	clientName: yup.string().notRequired(),
	startDate: yup.date().required("Start date is required"),
	endDate: yup
		.date()
		.notRequired()
		.min(yup.ref("startDate"), "End date must be after start date"),
	status: yup
		.string()
		.required("Status is required")
		.oneOf(PROJECT_STATUS as unknown as string[], "Invalid status"),
	priority: yup
		.string()
		.required("Priority is required")
		.oneOf(PROJECT_PRIORITY as unknown as string[], "Invalid priority"),
	budget: yup.number().min(0, "Budget must be positive").notRequired(),
	totalHoursAllocated: yup
		.number()
		.min(0, "Hours allocated must be positive")
		.notRequired(),
	teamSize: yup
		.number()
		.integer("Team size must be a whole number")
		.min(0, "Team size must be positive")
		.notRequired(),
	projectManager: yup.string().notRequired(),
	progress: yup
		.number()
		.min(0, "Progress must be at least 0")
		.max(100, "Progress cannot exceed 100")
		.notRequired(),
});
