import mongoose, { Document, Schema } from "mongoose";
import Counter from "./Counter";

export interface IProjectWorkLog extends Document {
	id: number;
	projectId: number;
	projectName: string;
	employeeId: number;
	employeeName: string;
	date: Date;
	hoursWorked: number;
	taskDescription?: string;
	notes?: string;
}

const ProjectWorkLogSchema: Schema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		projectId: { type: Number, required: true, ref: "Project" },
		projectName: { type: String, required: true },
		employeeId: { type: Number, required: true, ref: "Emp" },
		employeeName: { type: String, required: true },
		date: { type: Date, required: true },
		hoursWorked: { type: Number, required: true, min: 0 },
		taskDescription: { type: String },
		notes: { type: String },
	},
	{
		timestamps: true,
	}
);

// Auto-increment ID
ProjectWorkLogSchema.pre("validate", async function (next) {
	const doc = this as unknown as IProjectWorkLog;

	if (doc.isNew && doc.id == null) {
		const counter = await Counter.findByIdAndUpdate(
			{ _id: "projectWorkLogId" },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		);

		doc.id = counter!.seq;
	}

	next();
});

// Create compound index to prevent duplicate logs
ProjectWorkLogSchema.index({ projectId: 1, employeeId: 1, date: 1 });

const ProjectWorkLog = mongoose.model<IProjectWorkLog>(
	"ProjectWorkLog",
	ProjectWorkLogSchema
);

export default ProjectWorkLog;
