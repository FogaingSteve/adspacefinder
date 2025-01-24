import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell, Heart, MessageSquare, User, Plus } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-[#FF6E14]">
              MonSite
            </Link>
            <Button 
              asChild 
              className="hidden md:flex bg-[#FF6E14] hover:bg-[#FF5500] text-white"
            >
              <Link to="/listings/create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Déposer une annonce
              </Link>
            </Button>
            <div className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Rechercher sur leboncoin"
                className="pl-4 pr-10 py-2 border rounded-lg w-[400px] focus:outline-none focus:ring-2 focus:ring-[#FF6E14] focus:border-transparent"
              />
              <Button 
                className="absolute right-0 top-0 h-full px-3 bg-[#FF6E14] hover:bg-[#FF5500] rounded-l-none"
              >
                Rechercher
              </Button>
            </div>
          </div>

          {/* Desktop icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/listings/my-searches" className="flex flex-col items-center text-gray-600 hover:text-[#FF6E14]">
              <Bell className="h-6 w-6" />
              <span className="text-xs">Recherches</span>
            </Link>
            <Link to="/listings/favorites" className="flex flex-col items-center text-gray-600 hover:text-[#FF6E14]">
              <Heart className="h-6 w-6" />
              <span className="text-xs">Favoris</span>
            </Link>
            <Link to="/messages" className="flex flex-col items-center text-gray-600 hover:text-[#FF6E14]">
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs">Messages</span>
            </Link>
            <Link to="/auth/signin" className="flex flex-col items-center text-gray-600 hover:text-[#FF6E14]">
              <User className="h-6 w-6" />
              <span className="text-xs">Se connecter</span>
            </Link>
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

        {/* Categories bar */}
        <div className="hidden md:flex items-center space-x-6 py-2 text-sm">
          <Link to="/categories/immobilier" className="text-gray-600 hover:text-[#FF6E14]">
            Immobilier
          </Link>
          <Link to="/categories/vehicules" className="text-gray-600 hover:text-[#FF6E14]">
            Véhicules
          </Link>
          <Link to="/categories/locations" className="text-gray-600 hover:text-[#FF6E14]">
            Locations de vacances
          </Link>
          <Link to="/categories/emploi" className="text-gray-600 hover:text-[#FF6E14]">
            Emploi
          </Link>
          <Link to="/categories/mode" className="text-gray-600 hover:text-[#FF6E14]">
            Mode
          </Link>
          <Link to="/categories/maison" className="text-gray-600 hover:text-[#FF6E14]">
            Maison & Jardin
          </Link>
          <Link to="/categories/multimedia" className="text-gray-600 hover:text-[#FF6E14]">
            Multimédia
          </Link>
          <Link to="/categories/loisirs" className="text-gray-600 hover:text-[#FF6E14]">
            Loisirs
          </Link>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/listings/my-searches"
                className="text-gray-600 hover:text-[#FF6E14]"
                onClick={() => setIsMenuOpen(false)}
              >
                Mes recherches
              </Link>
              <Link
                to="/listings/favorites"
                className="text-gray-600 hover:text-[#FF6E14]"
                onClick={() => setIsMenuOpen(false)}
              >
                Favoris
              </Link>
              <Link
                to="/messages"
                className="text-gray-600 hover:text-[#FF6E14]"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/listings/create"
                className="text-gray-600 hover:text-[#FF6E14]"
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