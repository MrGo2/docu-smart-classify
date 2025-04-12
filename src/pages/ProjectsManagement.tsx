
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProjectList from "@/components/projects/ProjectList";
import ProjectDetails from "@/components/projects/ProjectDetails";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProjectForm from "@/components/projects/ProjectForm";

const ProjectsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
        
        // Select the first project by default if none is selected and projects exist
        if (!selectedProjectId && data && data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [refreshTrigger, selectedProjectId]);

  const handleProjectCreate = () => {
    setIsCreateDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleProjectUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No projects found</p>
            <Button 
              className="mt-4" 
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create your first project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Select a project to manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectList 
                projects={projects} 
                selectedProjectId={selectedProjectId}
                onSelect={handleProjectSelect}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-3">
            {selectedProjectId ? (
              <ProjectDetails 
                projectId={selectedProjectId} 
                onUpdate={handleProjectUpdate}
              />
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Select a project to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onComplete={handleProjectCreate} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManagement;
