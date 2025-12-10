import mongoose, { Document, Schema } from "mongoose";
import Counter from "./Counter";

export interface IProject extends Document {
	id: number;
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
}

const ProjectSchema: Schema = new Schema(
	{
		id: { type: Number, required: true, unique: true },
		projectName: { type: String, required: true },
		projectCode: { type: String, required: true, unique: true },
		description: { type: String },
		clientName: { type: String },
		startDate: { type: Date, required: true },
		endDate: { type: Date },
		status: {
			type: String,
			required: true,
			enum: ["Planning", "Active", "On Hold", "Completed", "Cancelled"],
			default: "Planning",
		},
		budget: { type: Number },
		totalHoursAllocated: { type: Number },
		totalHoursWorked: { type: Number, default: 0 },
		teamSize: { type: Number },
		projectManager: { type: String },
		priority: {
			type: String,
			required: true,
			enum: ["Low", "Medium", "High", "Critical"],
			default: "Medium",
		},
		progress: { type: Number, default: 0, min: 0, max: 100 },
	},
	{
		timestamps: true,
	}
);

// Auto-increment ID
ProjectSchema.pre("validate", async function (next) {
	const doc = this as unknown as IProject;

	if (doc.isNew && doc.id == null) {
		const counter = await Counter.findByIdAndUpdate(
			{ _id: "projectId" },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		);

		doc.id = counter!.seq;
	}

	next();
});

// Create index for project code
ProjectSchema.index({ projectCode: 1 }, { unique: true });

const Project = mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
