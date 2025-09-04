import { Button } from "@/components/ui/button";
import { Play, Edit3 } from "lucide-react";
import { useState } from "react";
import hotelShowreel from "@/assets/hotel-showreel.jpg";
import aromaticThumbnail from "@/assets/aromatic-atelier-thumbnail.jpg";
import ProjectCard from "./ProjectCard";
import LazyVideo from "./LazyVideo";
import safariProject from "@/assets/safari-project.jpg";
import hotelInterior from "@/assets/hotel-interior.jpg";
import experienceProject from "@/assets/experience-project.jpg";

const Hero = () => {
  const [editableText, setEditableText] = useState("Hotels, Safari and Travel Experience");
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(editableText);

  const handleSave = () => {
    setEditableText(tempText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempText(editableText);
    setIsEditing(false);
  };
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
    <section id="home" className="min-h-screen bg-black pt-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Headline - Sam Kolder style layout */}
        <div className="text-left space-y-16 animate-fade-in pt-[65px] pl-4 md:pl-8">
          <div className="space-y-6">
            <h1 className="text-2xl md:text-4xl font-light leading-relaxed tracking-tight lg:text-4xl">
              <span className="text-foreground font-normal">I'm a visual artist, I tell stories through Film and Photography</span>
              <br />
              <span className="text-foreground">that </span>
              <span className="text-foreground font-normal">captures stunning visuals for</span>
              <br />
              <span className="text-muted-foreground font-light italic">
                {isEditing ? (
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="text"
                      value={tempText}
                      onChange={(e) => setTempText(e.target.value)}
                      className="bg-transparent border-b border-muted-foreground/30 focus:border-muted-foreground outline-none font-light italic"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }}
                      autoFocus
                    />
                    <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                      ✓
                    </button>
                    <button onClick={handleCancel} className="text-red-400 hover:text-red-300">
                      ✕
                    </button>
                  </span>
                ) : (
                  <span className="group inline-flex items-center gap-2">
                    {editableText}
                    <button
                      onClick={() => {
                        setTempText(editableText);
                        setIsEditing(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </span>
            </h1>
          </div>

          {/* Contact Info - left aligned like reference */}
          <div className="flex flex-col md:flex-row items-start justify-start gap-8 text-muted-foreground text-sm font-light">
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Arusha,TZ / World</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>info@critospro.com</span>
            </div>
          </div>
        </div>

        {/* Showreel Video Container - integrated into hero */}
        <div className="mt-20 mb-20">
          <div className="relative group cursor-pointer animate-slide-up">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-card shadow-cinematic video-grain">
              <LazyVideo
                src="https://ijgrizsbxnevkngbidew.supabase.co/storage/v1/object/public/videos/cmapaign%20video/Aromatic%20Atlier%20.mp4"
                poster="https://ijgrizsbxnevkngbidew.supabase.co/storage/v1/object/public/thumbnails/Aromatic%20Atalier.jpg?v=1"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                eager={true}
                onLoadStart={() => {
                  // Smart autoplay based on connection and device
                  const connection = (navigator as any).connection;
                  const isGoodConnection = !connection || connection.effectiveType === '4g';
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                  
                  if (isGoodConnection && !isMobile) {
                    const video = document.querySelector('video');
                    if (video) {
                      setTimeout(() => video.play().catch(() => {}), 500);
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Brand Logos Section */}
          <div className="mt-20 space-y-12">
            <div className="flex flex-wrap items-center justify-center gap-16 opacity-40">
              <div className="text-muted-foreground font-light text-lg tracking-widest">TNS</div>
              <div className="text-muted-foreground font-light text-lg tracking-widest">EMERALD ESCAPE</div>
              <div className="text-muted-foreground font-light text-lg tracking-widest">NYUMBA NDOTO</div>
            </div>
          </div>
        </div>

        {/* Projects Grid Section - integrated into hero */}
        <div className="mt-20 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {projects.map((project, index) => (
              <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;