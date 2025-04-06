
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share, Mail, Copy, Check, Facebook, MessageCircle, Twitter } from "lucide-react";
import { toast } from "sonner";

interface ShareListingDialogProps {
  title: string;
  url: string;
}

export function ShareListingDialog({ title, url }: ShareListingDialogProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Lien copié dans le presse-papier");
  };
  
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Regarde cette annonce: ${title}`);
    const body = encodeURIComponent(`J'ai trouvé cette annonce qui pourrait t'intéresser: ${title}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };
  
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Regarde cette annonce: ${title} ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Découvrez cette annonce: ${title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager cette annonce</DialogTitle>
          <DialogDescription>
            Partagez cette annonce avec vos amis via différentes plateformes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <div className="grid flex-1 gap-2">
            <Input value={url} readOnly className="bg-gray-50" />
          </div>
          <Button size="sm" variant="outline" onClick={handleCopyLink} className="px-3">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-20 space-y-2"
            onClick={handleCopyLink}
          >
            <Copy className="h-5 w-5" />
            <span className="text-xs">Copier</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-20 space-y-2"
            onClick={handleEmailShare}
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs">Email</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-20 space-y-2"
            onClick={handleFacebookShare}
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-20 space-y-2"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-20 space-y-2"
            onClick={handleTwitterShare}
          >
            <Twitter className="h-5 w-5 text-blue-400" />
            <span className="text-xs">Twitter</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
