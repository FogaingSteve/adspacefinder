import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell, Heart, MessageSquare, User, Plus, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { categories } from "@/data/categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setShowLogoutDialog(false);
  };

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
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex flex-col items-center text-gray-600 hover:text-[#FF6E14]">
                    <User className="h-6 w-6" />
                    <span className="text-xs">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowLogoutDialog(true)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth/signin" className="flex flex-col items-center text-gray-600 hover:text-[#FF6E14]">
                <User className="h-6 w-6" />
                <span className="text-xs">Se connecter</span>
              </Link>
            )}
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

        {/* Categories bar with dropdowns */}
        <div className="hidden md:flex items-center space-x-6 py-2 text-sm border-t">
          {categories.map((category) => (
            <DropdownMenu key={category.id}>
              <DropdownMenuTrigger className="text-gray-600 hover:text-[#FF6E14] focus:outline-none">
                {category.name}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white">
                <DropdownMenuItem asChild>
                  <Link 
                    to={`/categories/${category.id}`}
                    className="flex items-center justify-between w-full font-semibold"
                  >
                    Voir toute la catégorie
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {category.subcategories.map((subcategory) => (
                  <DropdownMenuItem key={subcategory.id} asChild>
                    <Link 
                      to={`/categories/${category.id}/${subcategory.id}`}
                      className="flex items-center justify-between w-full"
                    >
                      {subcategory.name}
                      <span className="text-xs text-gray-500">
                        12 annonces
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
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
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-[#FF6E14]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-[#FF6E14]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-600 hover:text-[#FF6E14]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Paramètres
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowLogoutDialog(true);
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/auth/signin">Se connecter</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Déconnexion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};
