import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageUploadProps {
  onImageUpload: (imageData: string) => void;
  isProcessing?: boolean;
  currentImage?: string | null;
  onClear?: () => void;
}

// Compress image to target size and max dimension
async function compressImage(file: File, maxDimension = 1280, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;
      
      // Scale down if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
}

export function ImageUpload({ 
  onImageUpload, 
  isProcessing = false, 
  currentImage,
  onClear 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

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

  const processFile = async (file: File) => {
    setIsCompressing(true);
    try {
      // Compress image to reduce payload size (max 1280px, JPEG quality 0.7)
      const compressedDataUrl = await compressImage(file, 1280, 0.7);
      setIsCompressing(false);
      onImageUpload(compressedDataUrl);
    } catch (error) {
      console.error("Image compression failed:", error);
      setIsCompressing(false);
      // Fallback to original file if compression fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
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

      <Dialog open={isCompressing || isProcessing}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-analyzing-progress">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 animate-pulse text-primary" />
              {isCompressing ? "Preparing Image" : "Analyzing Damage"}
            </DialogTitle>
            <DialogDescription>
              {isCompressing 
                ? "Optimizing image for upload..." 
                : "AI is detecting and assessing vehicle damage..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
