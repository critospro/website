import { memo } from "react";
import OptimizedProjectCard from "./OptimizedProjectCard";
import safariProject from "@/assets/safari-project.jpg";
import hotelInterior from "@/assets/hotel-interior.jpg";
import experienceProject from "@/assets/experience-project.jpg";

const ProjectsGrid = memo(() => {
  // Projects data for Critos Pro
  const projects = [
    {
      title: "TNS kimarishe",
      client: "Wilderness Safari", 
      date: "4/22/2024",
      image: safariProject,
      isVideo: true,
      videoUrl: "https://www.youtube.com/watch?v=FrlyTL5fQts"
    },
    {
      title: "Luxury Resort",
      client: "Four Seasons",
      date: "3/15/2024", 
      image: hotelInterior,
      isVideo: true
    },
    {
      title: "Adventure Experience",
      client: "Airbnb Experiences",
      date: "2/28/2024",
      image: experienceProject, 
      isVideo: true
    },
    {
      title: "Hotel Campaign",
      client: "Marriott International", 
      date: "1/18/2024",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center",
      isVideo: true
    },
    {
      title: "Safari Documentary",
      client: "National Geographic",
      date: "12/10/2023",
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop&crop=center",
      isVideo: true  
    },
    {
      title: "Boutique Hotel",
      client: "Design Hotels",
      date: "11/22/2023",
      image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop&crop=center",
      isVideo: true
    }
  ];

  return (
    <section className="py-20 px-8 bg-gradient-primary">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
          {projects.map((project, index) => (
            <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <OptimizedProjectCard {...project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

ProjectsGrid.displayName = "ProjectsGrid";

export default ProjectsGrid;