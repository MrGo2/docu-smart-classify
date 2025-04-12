
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/utils/documentUtils";

interface ProjectListProps {
  projects: any[];
  selectedProjectId: string | null;
  onSelect: (projectId: string) => void;
}

const ProjectList = ({ projects, selectedProjectId, onSelect }: ProjectListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-3 rounded-md cursor-pointer transition-colors ${
              project.id === selectedProjectId
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelect(project.id)}
          >
            <div className="font-medium">{project.name}</div>
            <div className="flex items-center justify-between text-xs mt-1">
              <div className={`${
                project.id === selectedProjectId
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}>
                {formatDate(project.created_at)}
              </div>
              {project.client_name && (
                <Badge variant={project.id === selectedProjectId ? "outline" : "secondary"} className="ml-2">
                  {project.client_name}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProjectList;
