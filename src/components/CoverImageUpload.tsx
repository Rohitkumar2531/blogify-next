import { useRef, useState } from "react";
import { Image, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoverImageUploadProps {
  coverImage: string;
  onImageChange: (url: string) => void;
}

export default function CoverImageUpload({ coverImage, onImageChange }: CoverImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (coverImage) {
    return (
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-secondary">
        <img 
          src={coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 gap-2 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => onImageChange("")}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Remove</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          h-36 sm:h-44 md:h-48 
          bg-gradient-to-br from-secondary to-secondary/50 
          flex flex-col items-center justify-center 
          border-b border-border
          cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? "bg-primary/10 border-2 border-dashed border-primary" 
            : "hover:bg-secondary/80"
          }
        `}
      >
        <div className={`
          w-10 h-10 sm:w-12 sm:h-12 
          rounded-full 
          flex items-center justify-center 
          mb-2 sm:mb-3
          transition-all duration-300
          ${isDragging ? "bg-primary/20 scale-110" : "bg-primary/10"}
        `}>
          {isDragging ? (
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          ) : (
            <Image className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-1">
          {isDragging ? "Drop image here" : "Add a cover image"}
        </p>
        <p className="text-xs text-muted-foreground/70 hidden sm:block">
          Click to upload or drag and drop
        </p>
      </div>
    </>
  );
}
