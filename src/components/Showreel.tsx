import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import hotelShowreel from "@/assets/hotel-showreel.jpg";

const Showreel = () => {
  return (
    <section id="work" className="py-32 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Showreel Video Container - exact Sam Kolder styling */}
        <div className="relative group cursor-pointer animate-slide-up">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-card shadow-cinematic">
            <img 
              src={hotelShowreel} 
              alt="Critos Pro Showreel" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            
            {/* Play Button Overlay - exact styling */}
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="relative">
                {/* Circular Text Animation - exactly like Sam Kolder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-40 h-40" style={{ animation: 'spin 20s linear infinite' }}>
                    <defs>
                      <path
                        id="circle"
                        d="M 80,80 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0"
                      />
                    </defs>
                    <text className="text-xs fill-foreground font-light tracking-[0.3em] uppercase">
                      <textPath href="#circle">
                        • SHOWREEL • SHOWREEL • SHOWREEL • SHOWREEL 
                      </textPath>
                    </text>
                  </svg>
                </div>
                
                {/* Center Play Button */}
                <div className="flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="w-20 h-20 rounded-full bg-transparent border-2 border-foreground hover:bg-foreground hover:text-background transition-all duration-300 group-hover:scale-110"
                  >
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Logos Section - styled like Sam Kolder */}
        <div className="mt-20 space-y-12">
          <div className="flex flex-wrap items-center justify-center gap-16 opacity-40">
            <div className="text-muted-foreground font-light text-lg tracking-widest">MARRIOTT</div>
            <div className="text-muted-foreground font-light text-lg tracking-widest">HILTON</div>
            <div className="text-muted-foreground font-light text-lg tracking-widest">FOUR SEASONS</div>
            <div className="text-muted-foreground font-light text-lg tracking-widest">WILDERNESS</div>
            <div className="text-muted-foreground font-light text-lg tracking-widest">AIRBNB</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showreel;