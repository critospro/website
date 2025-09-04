import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import VideoUpload from "@/components/VideoUpload";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { PageManagement } from "@/components/PageManagement";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { projects, isLoading: projectsLoading, invalidateProjects } = useProjects();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/auth');
        return;
      }
      
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleUploadComplete = () => {
    invalidateProjects();
    toast.success('Project uploaded successfully!');
  };

  const navigateToSiteBuilder = () => {
    navigate('/site-builder');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-light text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Welcome, {user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={navigateToSiteBuilder}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Site Builder
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-8">
            {/* Video Upload Section */}
            <div className="mb-12">
              <VideoUpload onUploadComplete={handleUploadComplete} />
            </div>

            {/* Projects Grid */}
            <div className="space-y-8">
              <h2 className="text-2xl font-light text-foreground">Your Projects</h2>
              
              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No projects uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      title={project.title}
                      client={project.client}
                      date={project.date}
                      image={project.thumbnail_url || "/placeholder.svg"}
                      isVideo={project.is_video}
                      videoUrl={project.video_url}
                      thumbnailUrl={project.thumbnail_url}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pages" className="mt-8">
            <PageManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;