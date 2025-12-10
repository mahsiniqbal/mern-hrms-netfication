import mongoose, { Document, Schema } from "mongoose";
import Counter from "./Counter";

export interface IAttendance extends Document {
	id: number;
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

const AttendanceSchema: Schema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		employeeId: { type: Number, required: true, ref: "Emp" },
		employeeName: { type: String, required: true },
		date: { type: Date, required: true },
		status: {
			type: String,
			required: true,
			enum: ["Present", "Absent", "Half-Day", "Leave", "Holiday"],
			default: "Present",
		},
		checkInTime: { type: String },
		checkOutTime: { type: String },
		workHours: { type: Number },
		isLate: { type: Boolean, default: false },
		notes: { type: String },
	},
	{
		timestamps: true,
	}
);

// Auto-increment ID
AttendanceSchema.pre("validate", async function (next) {
	const doc = this as unknown as IAttendance;

	if (doc.isNew && doc.id == null) {
		const counter = await Counter.findByIdAndUpdate(
			{ _id: "attendanceId" },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		);

		doc.id = counter!.seq;
	}

	next();
});

// Create compound index to ensure one attendance record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
