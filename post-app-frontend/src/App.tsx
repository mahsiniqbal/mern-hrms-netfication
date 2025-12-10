// src/App.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { IEmployee } from "./types/Employee";

function App() {
	const [employees, setEmployees] = useState<IEmployee[]>([]);
	const [search, setSearch] = useState("");
	const [form, setForm] = useState<IEmployee>({
		empName: "",
		empId: "",
		position: "",
	});

	const fetchEmployees = async () => {
		const res = await axios.get<IEmployee[]>("/api/employees");
		setEmployees(res.data);
	};

	useEffect(() => {
		fetchEmployees();
	}, []);

	const addEmployee = async () => {
		const { empName, position } = form; // exclude empId
		const res = await axios.post<IEmployee>("/api/employees", {
			empName,
			position,
		});
		setEmployees(prev => [...prev, res.data]);
		setForm({ empName: "", empId: "", position: "" });
	};

	const deleteEmployee = async (id: string) => {
		await axios.delete(`/api/employees/${id}`);
		setEmployees(prev => prev.filter(emp => emp.empId !== id));
	};

	const filteredEmployees = employees.filter(emp =>
		emp?.empName?.toLowerCase().includes(search?.toLowerCase())
	);

	return (
		<div style={{ padding: 20, width: "100%" }}>
			<img
				style={{ maxWidth: 300 }}
				src="https://netfication.com/wp-content/uploads/2024/02/2qekZP7h4ZDMJcI2zJnV8Jy6EbL.svg"
			></img>
			<h1>Netfication Employee Management</h1>
			<div style={{ marginBottom: 20 }}>
				<input
					type="text"
					placeholder="Search employee..."
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
			</div>

			<div style={{ marginBottom: 20 }}>
				<input
					placeholder="Name"
					value={form.empName}
					onChange={e => setForm({ ...form, empName: e.target.value })}
				/>

				<input
					placeholder="Position"
					value={form.position}
					onChange={e => setForm({ ...form, position: e.target.value })}
				/>
				<button onClick={addEmployee}>Add IEmployee</button>
			</div>

			<ul>
				{filteredEmployees.map(emp => (
					<li key={emp.empId}>
						<p>
							<strong>{emp.empName}</strong> - ({emp.position})
						</p>
						<button onClick={() => deleteEmployee(emp.empId)}>Delete</button>
					</li>
				))}
			</ul>
			<ul>
				{employees?.map(emp => (
					<li key={emp.empId}>
						<p>
							<strong>{emp.empName}</strong> - ({emp.position})
						</p>
						<button onClick={() => deleteEmployee(emp.empId)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
}

export default App;
