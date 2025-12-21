import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  isProcessing?: boolean;
  currentImage?: string | null;
  onClear?: () => void;
}

export function ImageUpload({ 
  onImageUpload, 
  isProcessing = false, 
  currentImage,
  onClear 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<"idle" | "reading" | "uploading" | "analyzing">("idle");

  const isUploading = uploadStage !== "idle" || isProcessing;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    setUploadStage("reading");
    setUploadProgress(0);
    
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      }
    };
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadStage("uploading");
      setUploadProgress(0);
      
      // Simulate upload progress since we're using base64
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          setUploadStage("analyzing");
          onImageUpload(result);
          // Reset after a short delay to let isProcessing take over
          setTimeout(() => {
            setUploadStage("idle");
            setUploadProgress(0);
          }, 500);
        }
        setUploadProgress(Math.min(progress, 100));
      }, 150);
    };
    
    reader.readAsDataURL(file);
  };

  if (currentImage) {
    return (
      <div className="relative w-full h-full min-h-96 rounded-lg overflow-hidden bg-muted">
        <img 
          src={currentImage} 
          alt="Uploaded vehicle damage" 
          className="w-full h-full object-contain"
          data-testid="img-uploaded-damage"
        />
        {onClear && !isProcessing && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3"
            onClick={onClear}
            data-testid="button-clear-image"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm font-medium text-muted-foreground">
                Analyzing damage...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const getUploadMessage = () => {
    switch (uploadStage) {
      case "reading":
        return "Reading file...";
      case "uploading":
        return "Uploading image...";
      case "analyzing":
        return "Starting analysis...";
      default:
        return "";
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative w-full min-h-96 rounded-lg border-2 border-dashed transition-colors duration-200",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          "flex flex-col items-center justify-center gap-4 p-8"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="dropzone-image-upload"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="text-center">
          <p className="text-base font-medium">
            Drop vehicle damage photo here
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse files
          </p>
        </div>

        <label>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileSelect}
            data-testid="input-file-upload"
          />
          <Button variant="outline" asChild>
            <span className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </span>
          </Button>
        </label>

        <p className="text-xs text-muted-foreground">
          Supports JPG, PNG, WEBP up to 10MB
        </p>
      </div>

      <Dialog open={uploadStage !== "idle"}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-upload-progress">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Upload
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{getUploadMessage()}</p>
            <Progress value={uploadProgress} className="h-2" data-testid="progress-upload" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(uploadProgress)}%
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
