import { useState, ChangeEvent, DragEvent } from "react";

interface UseImageUploadProps {
  onImageLoaded: (dataUrl: string, file: File) => void;
  onError: (error: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export default function useImageUpload({
  onImageLoaded,
  onError,
  maxSizeMB = 5, // Default max size 5MB
  acceptedTypes = ["image/jpeg", "image/png", "image/gif"],
}: UseImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError(`File size exceeds the maximum limit of ${maxSizeMB}MB.`);
      return false;
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      onError(`File type not supported. Please upload: ${acceptedTypes.join(", ")}`);
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        onImageLoaded(e.target.result, file);
      } else {
        onError("Failed to read the file");
      }
    };
    reader.onerror = () => onError("Failed to read the file");
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return {
    isDragging,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
  };
}
