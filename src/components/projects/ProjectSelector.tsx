
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  name: string;
  description: string | null;
  client_name: string | null;
}

interface ProjectSelectorProps {
  selectedProject: string | null;
  onChange: (projectId: string) => void;
  disabled?: boolean;
}

const ProjectSelector = ({ selectedProject, onChange, disabled = false }: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    client_name: ""
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name, description, client_name")
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        setProjects(data || []);
        
        // If we have projects but none is selected, select the first one
        if (data && data.length > 0 && !selectedProject) {
          onChange(data[0].id);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [selectedProject, onChange]);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: newProject.name,
          description: newProject.description || null,
          client_name: newProject.client_name || null,
        })
        .select()
        .single();

      if (error) throw error;

      setProjects([...projects, data]);
      onChange(data.id);
      setShowNewProjectDialog(false);
      setNewProject({ name: "", description: "", client_name: "" });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="project">Project</Label>
          <Select
            value={selectedProject || ""}
            onValueChange={onChange}
            disabled={disabled || loading}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} {project.client_name ? `(${project.client_name})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => setShowNewProjectDialog(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="client">Client Name</Label>
              <Input
                id="client"
                value={newProject.client_name}
                onChange={(e) => setNewProject({ ...newProject, client_name: e.target.value })}
                placeholder="Enter client name (optional)"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Enter project description (optional)"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectSelector;
