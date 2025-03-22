import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import useImageUpload from "@/hooks/useImageUpload";
import { apiRequest } from "@/lib/queryClient";
import { Analysis } from "@shared/schema";

interface UploadSectionProps {
  onImageAnalyzed: (analysis: Analysis) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
}

export default function UploadSection({
  onImageAnalyzed,
  isAnalyzing,
  setIsAnalyzing,
  uploadedImage,
  setUploadedImage
}: UploadSectionProps) {
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { handleDrop, handleFileChange, handleDragOver, handleDragLeave, handleDragEnter, isDragging } = useImageUpload({
    onImageLoaded: (dataUrl, file) => {
      setUploadedImage(dataUrl);
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error,
      });
    },
  });
  
  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      // Convert base64 data URL to Blob
      const blob = await fetch(uploadedImage).then(r => r.blob());
      formData.append("image", blob, fileInfo?.name || "screenshot.png");
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      onImageAnalyzed(result);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the image",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleCancel = () => {
    setUploadedImage(null);
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
  
  return (
    <Card className="mb-8 bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-4 font-ibm">Upload Login Page Screenshot</h3>
        
        {!uploadedImage && !isAnalyzing && (
          <div
            className={`drop-zone rounded-lg p-8 mb-6 text-center cursor-pointer border-2 border-dashed border-primary transition-all ${
              isDragging ? "border-blue-500 bg-primary/5" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            <div className="mx-auto w-16 h-16 mb-4 text-primary">
              <Upload className="w-16 h-16" />
            </div>
            <p className="text-lg mb-2 font-ibm">Drag & drop your screenshot here</p>
            <p className="text-gray-500 text-sm mb-4 font-ibm">or</p>
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
              Browse Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500 mt-4 font-ibm">
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        )}
        
        {uploadedImage && !isAnalyzing && (
          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/3 mb-4 sm:mb-0 sm:mr-4">
              <img
                className="rounded-lg max-h-40 mx-auto"
                src={uploadedImage}
                alt="Preview of uploaded screenshot"
              />
            </div>
            <div className="w-full sm:w-2/3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium font-ibm">{fileInfo?.name}</span>
                <span className="text-sm text-gray-500 font-ibm">{fileInfo?.size}</span>
              </div>
              <div className="flex items-center">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white font-medium mr-3"
                  onClick={handleAnalyze}
                >
                  Analyze Now
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-secondary hover:text-secondary/90"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="text-center py-6">
            <Spinner className="inline-block h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-ibm">Analyzing your screenshot with our AI...</p>
            <p className="text-sm text-gray-500 mt-2 font-ibm">This typically takes 5-10 seconds</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
