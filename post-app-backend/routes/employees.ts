import express, { Request, Response } from "express";
import Emp from "../models/Emp";

const router = express.Router();

// Create a new employee
router.post("/", async (req: Request, res: Response) => {
	try {
		const newEmp = new Emp(req.body);
		const savedEmp = await newEmp.save();
		res.status(201).json(savedEmp);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

// Get all employees
router.get("/", async (_req: Request, res: Response) => {
	try {
		const employees = await Emp.find();
		res.json(employees);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get employee by ID
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const employee = await Emp.findById(req.params.id);
		if (!employee) return res.status(404).json({ error: "Not found" });
		res.json(employee);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Update employee by ID
router.put("/:id", async (req: Request, res: Response) => {
	try {
		const updatedEmp = await Emp.findOneAndUpdate(
			{ id: req.params.id },
			req.body,
			{
				new: true,
			}
		);
		if (!updatedEmp) return res.status(404).json({ error: "Not found" });
		res.json(updatedEmp);
	} catch (error: any) {
		res.status(400).json({ error: error.message });
	}
});

// Delete employee by ID
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const deletedEmp = await Emp.findOneAndDelete(
			{ id: req.params.id },
			req.body
		);

		if (!deletedEmp) return res.status(404).json({ error: "Not found" });
		res.json({ message: "Deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
