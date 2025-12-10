import { useParams } from "react-router";
import { Crud } from "@toolpad/core/Crud";
import { useProjectsServices } from "../hooks/projects/useProjectsServices";
import { IProject } from "../utils/api/types";

const ProjectsCrudPage = () => {
	const { ProjectDataSource, projectCache, projects } = useProjectsServices();
	const { projectId } = useParams();

	const projectRecord = projects.find(proj => proj.id.toString() === projectId);

	return (
		<Crud<IProject>
			dataSource={ProjectDataSource}
			rootPath="/projects"
			dataSourceCache={projectCache}
			initialPageSize={10}
			defaultValues={{ itemCount: 1 }}
			pageTitles={{
				show: `Project ${projectRecord?.projectName}`,
				create: "New Project",
				edit: projectRecord
					? `${projectRecord.projectCode} - ${projectRecord.projectName}`
					: "Edit Project",
			}}
		/>
	);
};

export default ProjectsCrudPage;
