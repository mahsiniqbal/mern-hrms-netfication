import * as yup from "yup";
import { DEPARTMENTS } from "../constants";

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
