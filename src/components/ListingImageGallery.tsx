
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListingImageGalleryProps {
  images: string[];
  title: string;
}

export function ListingImageGallery({ images, title }: ListingImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleOpenGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  // Si pas d'images, afficher une image par défaut
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src="/placeholder.svg"
          alt={title}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Image principale */}
        <div 
          className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => handleOpenGallery(currentImageIndex)}
        >
          <img
            src={images[currentImageIndex]}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "w-20 h-20 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2",
                  index === currentImageIndex ? "border-blue-500" : "border-transparent"
                )}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de galerie plein écran */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="sm:max-w-4xl p-0 bg-black/90 border-none max-h-screen overflow-hidden">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:bg-white/20 z-50"
              onClick={() => setIsGalleryOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <img
              src={images[currentImageIndex]}
              alt={`${title} - Image plein écran ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-10 w-10" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-10 w-10" />
                </Button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/20 px-3 py-1 rounded-full text-white">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
          
          {/* Miniatures dans la galerie */}
          <div className="flex justify-center space-x-2 p-4 bg-black">
            {images.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "w-16 h-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer border-2",
                  index === currentImageIndex ? "border-white" : "border-transparent"
                )}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
