import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = memo(() => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const projectTypes = [
    "Hotels", 
    "Safari",
    "Campaign",
    "Travel Experience"
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-6 px-12 bg-black">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-lg font-light text-white tracking-wide">
          critospro
        </Link>

        {/* Right side - Navigation and Contact Button */}
        <div className="hidden md:flex items-center gap-10">
          {/* Desktop Navigation */}
          <nav className="flex items-center gap-8">
            <Link to="/" className="text-sm font-light text-white hover:text-gray-300 transition-colors tracking-wider uppercase relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              HOME
            </Link>
            
            {/* Work/Projects Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-light text-white hover:text-gray-300 transition-colors tracking-wider uppercase flex items-center gap-1 bg-transparent border-none p-0 h-auto relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                WORK
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 backdrop-blur-sm border-gray-800 z-50">
                {projectTypes.map((type) => (
                  <DropdownMenuItem 
                    key={type}
                    className="text-white hover:bg-white/10 cursor-pointer text-sm font-light tracking-wider uppercase"
                  >
                    {type.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a href="#about" className="text-sm font-light text-white hover:text-gray-300 transition-colors tracking-wider uppercase relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
              ABOUT
            </a>
            
            {/* White line separator */}
            <div className="h-px w-12 bg-white/30"></div>
          </nav>

          {/* Contact & Admin Buttons */}
          <div className="flex items-center gap-4">
            {user && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10 rounded px-3 py-1.5 text-sm font-light tracking-wider uppercase"
                asChild
              >
                <Link to="/admin" className="flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  ADMIN
                </Link>
              </Button>
            )}
            <Button 
              size="sm"
              className="bg-white text-black hover:bg-gray-100 rounded-md px-4 py-1.5 text-sm font-light tracking-wider uppercase border-0 h-auto"
              asChild
            >
              <Link to="/contact">CONTACT</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 z-50">
          <nav className="flex flex-col items-center gap-6 py-8">
            <Link 
              to="/" 
              className="text-sm font-light text-white hover:text-gray-300 tracking-wider uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              HOME
            </Link>
            
            {/* Mobile Project Types */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-light tracking-wider uppercase text-gray-300">WORK</span>
              {projectTypes.map((type) => (
                <button 
                  key={type}
                  className="text-sm font-light tracking-wider uppercase text-white hover:text-gray-300 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
            
            <a 
              href="#about" 
              className="text-sm font-light text-white hover:text-gray-300 tracking-wider uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
            </a>
            
            {user && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10 rounded px-4 py-2 text-sm font-light tracking-wider uppercase"
                onClick={() => setIsMobileMenuOpen(false)}
                asChild
              >
                <Link to="/admin" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  ADMIN
                </Link>
              </Button>
            )}
            
            <Button 
              size="sm"
              className="bg-white text-black hover:bg-gray-100 rounded-md px-6 py-2.5 text-sm font-light tracking-wider uppercase border-0 h-auto mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
              asChild
            >
              <Link to="/contact">CONTACT</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
});

Header.displayName = "Header";

export default Header;