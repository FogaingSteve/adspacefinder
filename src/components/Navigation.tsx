import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              MonSite
            </Link>
            <div className="hidden md:flex items-center space-x-4 ml-8">
              <Link to="/categories" className="text-gray-600 hover:text-primary">
                Catégories
              </Link>
              <Link to="/listings/1" className="text-gray-600 hover:text-primary">
                Exemple d'annonce
              </Link>
            </div>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link to="/listings/create">Déposer une annonce</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth/signin">Se connecter</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/categories"
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Catégories
              </Link>
              <Link
                to="/listings/1"
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Exemple d'annonce
              </Link>
              <Link
                to="/listings/create"
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Déposer une annonce
              </Link>
              <Button
                asChild
                variant="outline"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/auth/signin">Se connecter</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};