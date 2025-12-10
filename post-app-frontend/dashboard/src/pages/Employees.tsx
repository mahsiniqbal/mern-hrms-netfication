import { useParams } from "react-router";
import { Crud } from "@toolpad/core/Crud";
import { useEmployeesServices } from "../hooks/employees/useEmployeesServices";
import { IEmployee } from "../utils/api/types";

const EmployeesCrudPage = () => {
	const { EmployeesDataSource, employeesCache } = useEmployeesServices();
	const { employeeId } = useParams();
	return (
		<Crud<IEmployee>
			dataSource={EmployeesDataSource}
			rootPath="/employees"
			dataSourceCache={employeesCache}
			initialPageSize={10}
			defaultValues={{ itemCount: 1 }}
			pageTitles={{
				show: `Employee ${employeeId}`,
				create: "New Employee",
				edit: `Employee ${employeeId} - Edit`,
			}}
		/>
	);
};

export default EmployeesCrudPage;
