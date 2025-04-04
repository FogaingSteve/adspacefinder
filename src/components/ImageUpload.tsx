import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { UseFormSetValue, UseFormRegister, FieldErrors } from "react-hook-form";
import { CreateListingDTO } from "@/types/listing";

interface ImageUploadProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  onRemove?: (url: string) => void;
  images?: string[];
  setImages?: (images: string[]) => void;
  onImageUpload?: (images: File[]) => Promise<string[]>;
  setValue?: UseFormSetValue<CreateListingDTO>;
  register?: UseFormRegister<CreateListingDTO>;
  errors?: FieldErrors<CreateListingDTO>;
}

export const ImageUpload = ({
  value = [], 
  onChange = () => {},
  onRemove = () => {},
  images,
  setImages,
  onImageUpload,
  setValue,
  register,
  errors
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageStatus, setImageStatus] = useState<Record<string, boolean>>({});

  // Determine which value to use - either images or value prop
  const imagesToDisplay = images || value;
  
  // Determine which change handler to use
  const handleChange = (newImages: string[]) => {
    if (setImages) {
      setImages(newImages);
    }
    if (setValue) {
      setValue("images", newImages);
    }
    onChange(newImages);
  };

  // Determine which remove handler to use
  const handleRemove = (url: string) => {
    if (setImages && images) {
      setImages(images.filter(image => image !== url));
    }
    onRemove(url);
  };

  // Vérifier si les images sont toujours valides
  useEffect(() => {
    const checkImages = async () => {
      if (!Array.isArray(imagesToDisplay) || imagesToDisplay.length === 0) return;
      
      const newStatus: Record<string, boolean> = {};
      
      // Pour chaque image, vérifier si elle est toujours accessible
      for (const url of imagesToDisplay) {
        if (!url) continue;
        
        try {
          // Tenter de précharger l'image pour vérifier sa validité
          const response = await fetch(url, { method: 'HEAD' });
          newStatus[url] = response.ok;
        } catch (error) {
          console.error(`Error checking image ${url}:`, error);
          newStatus[url] = false;
        }
      }
      
      setImageStatus(newStatus);
    };
    
    checkImages();
  }, [imagesToDisplay]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Vérifier la taille des fichiers (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = Array.from(files).filter(file => {
      if (file.size > MAX_SIZE) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) {
      setIsUploading(false);
      return;
    }
    
    try {
      if (onImageUpload) {
        // Use the provided onImageUpload function
        const fileArray = Array.from(files);
        const urls = await onImageUpload(fileArray);
        
        // Update image status
        const newStatus = {...imageStatus};
        urls.forEach((url: string) => {
          newStatus[url] = true;
        });
        setImageStatus(newStatus);
        
        // Add new URLs to existing list
        const newImages = [...(Array.isArray(imagesToDisplay) ? imagesToDisplay : []), ...urls];
        handleChange(newImages);
        toast.success(`${urls.length} images téléchargées avec succès`);
      } else {
        // Use the original upload method
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('images', file);
        });
        
        const response = await axios.post('http://localhost:5000/api/listings/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data && response.data.urls) {
          // Update image status
          const newStatus = {...imageStatus};
          response.data.urls.forEach((url: string) => {
            newStatus[url] = true;
          });
          setImageStatus(newStatus);
          
          // Add new URLs to existing list
          const newImages = [...(Array.isArray(imagesToDisplay) ? imagesToDisplay : []), ...response.data.urls];
          handleChange(newImages);
          toast.success(`${response.data.urls.length} images téléchargées avec succès`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'upload des images:", error);
      toast.error("Erreur lors de l'upload des images");
    } finally {
      setIsUploading(false);
    }
  };

  // Ensure value is always an array and filter out invalid images
  const displayImages = Array.isArray(imagesToDisplay) ? imagesToDisplay.filter(url => url) : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(imagesToDisplay) && imagesToDisplay.filter(url => url).map((url, index) => (
          <div key={`${url}-${index}`} className="relative group">
            <div className="h-48 rounded-lg bg-gray-100 flex items-center justify-center">
              <img
                src={imageStatus[url] === false ? "https://via.placeholder.com/400x300?text=Image+non+disponible" : url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // On error, set a placeholder image
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                  
                  // Update image status
                  setImageStatus(prev => ({...prev, [url]: false}));
                }}
              />
            </div>
            <button
              onClick={() => handleRemove(url)}
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
      {isUploading && (
        <div className="text-center text-sm text-gray-500">
          Téléchargement des images en cours...
        </div>
      )}
    </div>
  );
};
