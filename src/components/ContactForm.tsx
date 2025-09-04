import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a success message
    toast({
      title: "Message sent successfully!",
      description: "Thank you for your message. I'll get back to you soon.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-grotesk">
      {/* Main Content */}
      <section className="padding-global">
        <div className="container-large max-w-6xl mx-auto px-6">
          <div className="padding-section-huge py-20">
            
            {/* Header */}
            <div className="text-center mb-20">
              <div className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase mb-8">
                CONTACT
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white mb-12 tracking-tight">
                What's up?
              </h1>
            </div>

            {/* Contact Form */}
            <div className="max-w-lg mx-auto mb-20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-400 text-sm font-normal">
                      First name*
                    </Label>
                    <Input
                      id="firstName"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-gray-800/50 border-none text-white placeholder:text-gray-500 h-12 rounded-sm"
                      placeholder=""
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-400 text-sm font-normal">
                      Last name*
                    </Label>
                    <Input
                      id="lastName"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-gray-800/50 border-none text-white placeholder:text-gray-500 h-12 rounded-sm"
                      placeholder=""
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-400 text-sm font-normal">
                    Email*
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-800/50 border-none text-white placeholder:text-gray-500 h-12 rounded-sm"
                    placeholder=""
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-400 text-sm font-normal">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-gray-800/50 border-none text-white placeholder:text-gray-500 min-h-[120px] resize-none rounded-sm"
                    placeholder="Start typing here ..."
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800/50"
                    required
                  />
                  <Label htmlFor="terms" className="text-gray-400 text-sm font-normal">
                    I agree to the{" "}
                    <span className="underline cursor-pointer">terms</span> &{" "}
                    <span className="underline cursor-pointer">privacy policy</span>.*
                  </Label>
                </div>

                <div className="flex justify-center mt-8">
                  <Button 
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-normal px-12 py-3 h-12 rounded-sm tracking-wide"
                  >
                    SUBMIT
                  </Button>
                </div>
              </form>
            </div>

            {/* Contact Information - Sam Kolder Style */}
            <div className="contact_component">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                <div className="contact_item">
                  <h2 className="text-white text-lg font-normal mb-3">
                    Address
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Arusha and Worldwide
                  </p>
                </div>
                
                <div className="contact_item">
                  <h2 className="text-white text-lg font-normal mb-3">
                    Get in touch
                  </h2>
                  <div className="contact_links">
                    <a href="mailto:hello@critos.pro" className="contact_link flex items-center space-x-2 text-white hover:underline">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <span>hello@critos.pro</span>
                    </a>
                  </div>
                </div>
                
                <div className="contact_item">
                  <h2 className="text-white text-lg font-normal mb-3">
                    Socials
                  </h2>
                  <div className="contact_socials">
                    <a href="https://www.instagram.com/critos_pro/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactForm;