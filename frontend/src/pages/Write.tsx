import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bold, Italic, List, Link2, Quote, Code, Send, Save, Image, Moon, Sun, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useToast } from "@/hooks/use-toast";
import writeBackground from "@/assets/write-background.jpg";
import { useAuth } from "@/contexts/AuthContext";

type BackgroundMode = "dark" | "light" | "minimal";


const Write = () => {
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("dark");
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: draftData, isLoading: isDraftLoading } = useQuery({
    queryKey: ['blog', draftId],
    queryFn: () => {
      const token = localStorage.getItem('token');
      return fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${draftId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(res => res.json());
    },
    enabled: !!draftId,
  });

  useEffect(() => {
    if (draftData) {
      setTitle(draftData.blog.title);
      setContent(draftData.blog.content);
      setCoverImage(draftData.blog.coverImage);
    }
  }, [draftData]);
  
  const mutation = useMutation({
    mutationFn: (newBlog: { title: string; content: string; coverImage: string, status: string }) => {
      const token = localStorage.getItem('token');
      const method = draftId ? 'PATCH' : 'POST';
      const url = draftId
        ? `${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs/${draftId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/v1/blogs`;

      return fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBlog),
      }).then(res => {
        if (!res.ok) {
          throw new Error('Failed to publish post');
        }
        return res.json();
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      if (data.blog.status === 'published') {
        toast({
          title: "Post published!",
          description: "Your blog post has been published successfully.",
        });
        navigate(`/blog/${data.blog._id}`);
      } else {
        toast({
          title: "Draft saved!",
          description: "Your draft has been saved successfully.",
        });
        navigate('/profile');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const cycleBackgroundMode = () => {
    const modes: BackgroundMode[] = ["dark", "light", "minimal"];
    const currentIndex = modes.indexOf(backgroundMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setBackgroundMode(modes[nextIndex]);
    toast({
      title: `${modes[nextIndex].charAt(0).toUpperCase() + modes[nextIndex].slice(1)} Mode`,
      description: `Switched to ${modes[nextIndex]} background`,
    });
  };

  const getBackgroundModeIcon = () => {
    switch (backgroundMode) {
      case "dark": return Moon;
      case "light": return Sun;
      case "minimal": return Minimize2;
    }
  };

  const BackgroundIcon = getBackgroundModeIcon();

  const handlePublish = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to publish a post.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add a title and content to your post.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ title, content, coverImage, status: 'published' });
  };

  const handleSaveDraft = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to save a draft.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add a title and content to your draft.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ title, content, coverImage, status: 'draft' });
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    
    setContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      }
    }, 0);
  };

  const handleToolbarClick = (label: string) => {
    switch (label) {
      case "Bold":
        insertFormatting("**");
        break;
      case "Italic":
        insertFormatting("*");
        break;
      case "List":
        insertFormatting("\n- ", "");
        break;
      case "Link":
        const url = prompt("Enter URL:");
        if (url) {
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = content.substring(start, end) || "link text";
            const newText = content.substring(0, start) + `[${selectedText}](${url})` + content.substring(end);
            setContent(newText);
          }
        }
        break;
      case "Quote":
        insertFormatting("\n> ", "");
        break;
      case "Code":
        insertFormatting("`");
        break;
      case "Image":
        const imageUrl = prompt("Enter image URL:");
        if (imageUrl) {
          insertFormatting(`\n![image](${imageUrl})\n`, "");
        }
        break;
    }
  };

  const toolbarButtons = [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: List, label: "List" },
    { icon: Link2, label: "Link" },
    { icon: Quote, label: "Quote" },
    { icon: Code, label: "Code" },
    { icon: Image, label: "Image" },
  ];

  return (
    <div className={`min-h-screen relative transition-colors duration-500 ${
      backgroundMode === "light" ? "bg-amber-50" : "bg-background"
    }`}>
      {/* Background with stationery pattern - only show for dark and light modes */}
      {backgroundMode !== "minimal" && (
        <>
          <div 
            className={`fixed inset-0 z-0 transition-opacity duration-500 ${
              backgroundMode === "dark" ? "opacity-60" : "opacity-70"
            }`}
            style={{
              backgroundImage: `url(${writeBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              filter: backgroundMode === "light" ? "sepia(0.3) saturate(1.2) brightness(1.1)" : "none"
            }}
          />
          <div className={`fixed inset-0 z-0 transition-all duration-500 ${
            backgroundMode === "dark" 
              ? "bg-gradient-to-b from-background/40 via-background/60 to-background/80"
              : "bg-gradient-to-br from-amber-50/80 via-orange-50/70 to-yellow-50/80"
          }`} />
        </>
      )}
      
      {/* Minimal mode solid background */}
      {backgroundMode === "minimal" && (
        <div className="fixed inset-0 z-0 bg-background" />
      )}
      
      <Navbar />
      
      <main className="pt-16 relative z-10">
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Create a new post
                </h1>
                <p className="text-muted-foreground mt-1">
                  Share your thoughts with the world
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={cycleBackgroundMode} 
                  className="shrink-0"
                  title={`Current: ${backgroundMode} mode (click to change)`}
                >
                  <BackgroundIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleSaveDraft} className="gap-2 flex-1 sm:flex-none">
                  <Save className="w-4 h-4" />
                  <span className="hidden xs:inline">Save Draft</span>
                  <span className="xs:hidden">Save</span>
                </Button>
                <Button onClick={handlePublish} disabled={mutation.isPending} className="gap-2 flex-1 sm:flex-none">
                  {mutation.isPending ? 'Publishing...' : <><Send className="w-4 h-4" /> Publish</>}
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="relative group animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Glowing border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
              
              <div className="relative bg-card rounded-2xl overflow-hidden shadow-lg">
                {/* Cover Image */}
                <CoverImageUpload 
                  coverImage={coverImage} 
                  onImageChange={setCoverImage} 
                />

                {/* Title */}
                <div className="p-4 sm:p-6 pb-0">
                  <Input
                    type="text"
                    placeholder="Your post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl sm:text-3xl font-bold border-0 bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Toolbar */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border/50">
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
                    {toolbarButtons.map((button) => {
                      const Icon = button.icon;
                      return (
                        <button
                          key={button.label}
                          onClick={() => handleToolbarClick(button.label)}
                          className="p-2 sm:p-2.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-all duration-200 touch-manipulation"
                          title={button.label}
                          type="button"
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Start writing your story..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] sm:min-h-[400px] text-base sm:text-lg leading-relaxed border-0 bg-transparent px-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 p-4 sm:p-6 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in" style={{ animationDelay: "200ms" }}>
              <h3 className="font-semibold text-foreground mb-3">Writing Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Use a compelling title that captures the essence of your post
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Break your content into smaller paragraphs for better readability
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Add images to make your post more engaging
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Write;
