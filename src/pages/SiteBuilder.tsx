import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteBuilder } from "@/components/SiteBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SiteBuilderPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b p-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </Button>
      </div>
      
      {user && (
        <SiteBuilder 
          userId={user.id}
          onClose={() => navigate('/admin')}
        />
      )}
    </div>
  );
};

export default SiteBuilderPage;