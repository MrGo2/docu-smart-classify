
import { useState, useEffect } from "react";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ProjectForm from "./ProjectForm";
import ProjectDocuments from "./ProjectDocuments";
import { formatDate } from "@/utils/documentUtils";
import { toast } from "sonner";

interface ProjectDetailsProps {
  projectId: string;
  onUpdate: () => void;
}

const ProjectDetails = ({ projectId, onUpdate }: ProjectDetailsProps) => {
  const [project, setProject] = useState<any>(null);
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Count documents in this project
        const { count, error: countError } = await supabase
          .from("documents")
          .select("*", { count: 'exact', head: true })
          .eq("project_id", projectId);
        
        if (countError) throw countError;
        setDocumentsCount(count || 0);
      } catch (error) {
        console.error("Error fetching project details:", error);
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleEditComplete = () => {
    setIsEditDialogOpen(false);
    onUpdate();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // First check if there are any documents for this project
      if (documentsCount > 0) {
        // We should warn the user before deleting documents
        toast.warning(`Project contains ${documentsCount} documents. Delete those first or reassign them to another project.`);
        setIsDeleteDialogOpen(false);
        setIsDeleting(false);
        return;
      }
      
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
        
      if (error) throw error;
      
      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(`Failed to delete project: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Loading project details...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "Project not found"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{project.name}</CardTitle>
            {project.client_name && (
              <CardDescription className="mt-1">
                Client: {project.client_name}
              </CardDescription>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <Tabs defaultValue="overview">
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="text-muted-foreground mt-1">
                    {project.description || "No description provided"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{formatDate(project.created_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Default OCR Language</p>
                    <p>{project.default_ocr_language}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Default OCR Provider</p>
                    <p>{project.default_ocr_provider}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Default AI Model</p>
                    <p>{project.default_ai_model || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p>{documentsCount}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              <ProjectDocuments projectId={projectId} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            initialData={project} 
            onComplete={handleEditComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project {project.name} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectDetails;
