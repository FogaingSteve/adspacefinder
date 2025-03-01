import { Car, Smartphone, Shirt, Home, Microwave, Armchair, Briefcase, Handshake, Baby, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const categoryIcons = {
  "vehicules": Car,
  "electronique": Smartphone,
  "mode": Shirt,
  "immobilier": Home,
  "electromenager": Microwave,
  "maison": Armchair,
  "emplois": Briefcase,
  "services": Handshake,
  "enfant": Baby,
  "sports": Trophy
};

export const topCategories = [
  { icon: Car, name: "Véhicules", link: "/categories/vehicules" },
  { icon: Smartphone, name: "Electronique", link: "/categories/electronique" },
  { icon: Shirt, name: "Mode & Beauté", link: "/categories/mode" },
  { icon: Home, name: "Immobilier", link: "/categories/immobilier" },
  { icon: Microwave, name: "Electroménager", link: "/categories/electromenager" },
  { icon: Armchair, name: "Pour la maison", link: "/categories/maison" },
  { icon: Briefcase, name: "Emplois", link: "/categories/emplois" },
  { icon: Handshake, name: "Services", link: "/categories/services" },
  { icon: Baby, name: "Pour l'enfant", link: "/categories/enfant" },
  { icon: Trophy, name: "Sports & Loisirs", link: "/categories/sports" },
];

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        return response.data;
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
      }
    }
  });
};
