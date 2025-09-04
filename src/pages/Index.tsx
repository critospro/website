import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PhotographyGrid from "@/components/PhotographyGrid";
import { QuickCustomizer } from "@/components/QuickCustomizer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PhotographyGrid />
      {import.meta.env.DEV && <QuickCustomizer userId={user?.id} />}
    </div>
  );
};

export default Index;