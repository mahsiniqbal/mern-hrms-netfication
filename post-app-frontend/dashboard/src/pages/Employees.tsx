import { useParams } from "react-router";
import { Crud } from "@toolpad/core/Crud";
import { useEmployeesServices } from "../hooks/employees/useEmployeesServices";
import { IEmployee } from "../utils/api/types";

const EmployeesCrudPage = () => {
	const { EmployeesDataSource, employeesCache, employees } =
		useEmployeesServices();
	const { employeeId } = useParams();
	const employeeName = employees.find(
		emp => emp.id.toString() === employeeId
	)?.empName;
	return (
		<Crud<IEmployee>
			dataSource={EmployeesDataSource}
			rootPath="/employees"
			dataSourceCache={employeesCache}
			initialPageSize={10}
			defaultValues={{ itemCount: 1 }}
			pageTitles={{
				show: `${employeeName}`,
				create: "New Employee",
				edit: `${employeeName ?? ""} - Edit`,
			}}
		/>
	);
};

export default EmployeesCrudPage;
