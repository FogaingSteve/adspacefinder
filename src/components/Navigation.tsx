import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            Annonces
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/listings" className="text-gray-600 hover:text-primary">
              Parcourir
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-primary">
              Catégories
            </Link>
            <Button asChild variant="outline" className="ml-4">
              <Link to="/auth/signin">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link to="/listings/create">Publier une annonce</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/listings"
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Parcourir
              </Link>
              <Link
                to="/categories"
                className="text-gray-600 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Catégories
              </Link>
              <Button
                asChild
                variant="outline"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/auth/signin">Se connecter</Link>
              </Button>
              <Button
                asChild
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/listings/create">Publier une annonce</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};