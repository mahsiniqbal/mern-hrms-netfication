import { useParams } from "react-router";
import { Crud } from "@toolpad/core/Crud";
import { useAttendanceServices } from "../hooks/attendance/useAttendanceServices";
import { useEmployeesServices } from "../hooks/employees/useEmployeesServices";
import { IAttendance } from "../utils/api/types";

const AttendanceCrudPage = () => {
	const { employees } = useEmployeesServices();
	const { AttendanceDataSource, attendanceCache, attendance } =
		useAttendanceServices(employees);
	const { attendanceId } = useParams();

	const attendanceRecord = attendance.find(
		att => att.id.toString() === attendanceId
	);

	return (
		<Crud<IAttendance>
			dataSource={AttendanceDataSource}
			rootPath="/attendance"
			dataSourceCache={attendanceCache}
			initialPageSize={10}
			defaultValues={{ itemCount: 1 }}
			pageTitles={{
				show: `Attendance Record : ${attendanceRecord?.employeeName} |  ${
					attendanceRecord &&
					new Date(attendanceRecord.date).toLocaleDateString()
				}`,
				create: "New Attendance Record",
				edit: attendanceRecord
					? `${attendanceRecord.employeeName} - ${new Date(
							attendanceRecord.date
						).toLocaleDateString()}`
					: "Edit Attendance",
			}}
		/>
	);
};

export default AttendanceCrudPage;
