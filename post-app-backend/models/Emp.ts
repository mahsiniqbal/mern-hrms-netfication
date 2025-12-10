import mongoose, { Document, Schema } from "mongoose";
import Counter from "./Counter";

export interface IEmployee extends Document {
	id: number;
	empName: string;
	position: string;
	department: string;
	hireDate: Date;
}

const EmployeeSchema: Schema = new Schema({
	id: { type: Number, required: true, unique: true },
	empName: { type: String, required: true },
	position: { type: String, required: true },
	department: { type: String, required: true },
	hireDate: { type: String, required: true },
	email: { type: String, required: true, unique: true },
});
// Create a virtual field
EmployeeSchema.pre("validate", async function (next) {
	const doc = this as unknown as IEmployee;

	if (doc.isNew && doc.id == null) {
		const counter = await Counter.findByIdAndUpdate(
			{ _id: "employeeId" },
			{ $inc: { seq: 1 } },
			{ new: true, upsert: true }
		);

		doc.id = counter!.seq;
	}

	next();
});

const Emp = mongoose.model<IEmployee>("Emp", EmployeeSchema);

export default Emp;
