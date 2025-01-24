import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
}

export const ImageUpload = ({
  value = [], // Provide default empty array
  onChange,
  onRemove
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    
    // Simulate upload - in a real app, you would upload to a server
    const newImages = Array.from(files).map(file => {
      return URL.createObjectURL(file);
    });

    onChange([...(Array.isArray(value) ? value : []), ...newImages]);
    setIsUploading(false);
  };

  // Ensure value is always an array
  const images = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((url) => (
          <div key={url} className="relative group">
            <img
              src={url}
              alt="Uploaded"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => onRemove(url)}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white 
                       opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center w-full">
        <label className="w-full">
          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImagePlus className="h-8 w-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Cliquez pour ajouter</span> ou glissez et déposez
              </p>
              <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={onUpload}
              disabled={isUploading}
            />
          </div>
        </label>
      </div>
    </div>
  );
};