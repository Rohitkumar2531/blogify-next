import { useState } from "react";
import { Bold, Italic, List, Link2, Quote, Code, Send, Save, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import CoverImageUpload from "@/components/CoverImageUpload";
import { useToast } from "@/hooks/use-toast";

const Write = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const { toast } = useToast();

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing content",
        description: "Please add a title and content to your post.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Post published!",
      description: "Your blog post has been published successfully.",
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your draft has been saved.",
    });
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Create a new post
                </h1>
                <p className="text-muted-foreground mt-1">
                  Share your thoughts with the world
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish} className="gap-2">
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Cover Image */}
              <CoverImageUpload 
                coverImage={coverImage} 
                onImageChange={setCoverImage} 
              />

              {/* Title */}
              <div className="p-6 pb-0">
                <Input
                  type="text"
                  placeholder="Your post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-3xl font-bold border-0 bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center gap-1 flex-wrap">
                  {toolbarButtons.map((button) => {
                    const Icon = button.icon;
                    return (
                      <button
                        key={button.label}
                        className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title={button.label}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <Textarea
                  placeholder="Start writing your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] text-lg leading-relaxed border-0 bg-transparent px-0 resize-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl animate-fade-in" style={{ animationDelay: "200ms" }}>
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
