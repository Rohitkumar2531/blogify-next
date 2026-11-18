import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 border-t border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>© 2026 Blogify. All rights reserved.</span>
        <span className="hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in 2026
        </span>
      </div>
    </footer>
  );
};

export default Footer;
