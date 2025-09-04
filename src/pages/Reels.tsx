import Header from "@/components/Header";
import ReelsGrid from "@/components/ReelsGrid";
import { useProjects } from "@/hooks/useProjects";

const Reels = () => {
  const { projects, isLoading } = useProjects();
  
  // Filter for reel videos - you can adjust this logic based on your criteria
  const reelProjects = projects.filter(project => 
    project.is_video && project.video_url
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-light text-foreground mb-4">
              Reels
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of short-form video content showcasing our creative storytelling
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ReelsGrid projects={reelProjects} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Reels;