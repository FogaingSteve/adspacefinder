export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
  unit?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  attributes: CategoryAttribute[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    id: "vehicules",
    name: "Véhicules",
    icon: "Car",
    subcategories: [
      {
        id: "voitures",
        name: "Voitures",
        attributes: [
          { name: "Marque", type: "select", options: ["Renault", "Peugeot", "Citroën", "BMW", "Audi", "Mercedes", "Toyota", "Honda"], required: true },
          { name: "Année", type: "number", required: true },
          { name: "Kilométrage", type: "number", required: true, unit: "km" },
          { name: "Carburant", type: "select", options: ["Essence", "Diesel", "Électrique", "Hybride"], required: true }
        ]
      },
      {
        id: "motos",
        name: "Motos",
        attributes: [
          { name: "Marque", type: "select", options: ["Yamaha", "Honda", "Kawasaki", "BMW", "Ducati"], required: true },
          { name: "Cylindrée", type: "number", required: true, unit: "cc" },
          { name: "Année", type: "number", required: true }
        ]
      },
      {
        id: "location-voitures",
        name: "Location de voitures",
        attributes: [
          { name: "Type de véhicule", type: "select", options: ["Citadine", "Berline", "SUV", "Utilitaire"], required: true },
          { name: "Durée minimum", type: "number", required: true, unit: "jours" },
          { name: "Chauffeur inclus", type: "boolean" }
        ]
      }
    ]
  },
  {
    id: "electronique",
    name: "Électronique",
    icon: "Smartphone",
    subcategories: [
      {
        id: "telephones",
        name: "Téléphones",
        attributes: [
          { name: "Marque", type: "select", options: ["Apple", "Samsung", "Huawei", "Xiaomi"], required: true },
          { name: "État", type: "select", options: ["Neuf", "Très bon état", "Bon état", "Correct"], required: true }
        ]
      },
      {
        id: "tv",
        name: "TV",
        attributes: [
          { name: "Taille", type: "number", required: true, unit: "pouces" },
          { name: "Smart TV", type: "boolean" },
          { name: "Résolution", type: "select", options: ["HD", "Full HD", "4K", "8K"], required: true }
        ]
      },
      {
        id: "ordinateurs",
        name: "Ordinateurs",
        attributes: [
          { name: "Type", type: "select", options: ["Portable", "Bureau", "Tablette"], required: true },
          { name: "Processeur", type: "text", required: true },
          { name: "RAM", type: "number", required: true, unit: "GB" }
        ]
      }
    ]
  },
  {
    id: "mode",
    name: "Mode & Beauté",
    icon: "Shirt",
    subcategories: [
      {
        id: "vetements-homme",
        name: "Vêtements Homme",
        attributes: [
          { name: "Type", type: "select", options: ["T-shirt", "Pantalon", "Veste", "Costume"], required: true },
          { name: "Taille", type: "select", options: ["S", "M", "L", "XL", "XXL"], required: true }
        ]
      },
      {
        id: "vetements-femme",
        name: "Vêtements Femme",
        attributes: [
          { name: "Type", type: "select", options: ["Robe", "Jupe", "Pantalon", "Haut"], required: true },
          { name: "Taille", type: "select", options: ["XS", "S", "M", "L", "XL"], required: true }
        ]
      },
      {
        id: "chaussures",
        name: "Chaussures",
        attributes: [
          { name: "Type", type: "select", options: ["Homme", "Femme", "Enfant"], required: true },
          { name: "Pointure", type: "number", required: true }
        ]
      },
      {
        id: "bijoux",
        name: "Bijoux",
        attributes: [
          { name: "Type", type: "select", options: ["Collier", "Bague", "Bracelet", "Montre"], required: true },
          { name: "Matériau", type: "select", options: ["Or", "Argent", "Plaqué or", "Autre"], required: true }
        ]
      }
    ]
  },
  {
    id: "immobilier",
    name: "Immobilier",
    icon: "Home",
    subcategories: [
      {
        id: "terrains",
        name: "Terrains",
        attributes: [
          { name: "Surface", type: "number", required: true, unit: "m²" },
          { name: "Titre foncier", type: "boolean", required: true }
        ]
      },
      {
        id: "chambres",
        name: "Chambres",
        attributes: [
          { name: "Surface", type: "number", required: true, unit: "m²" },
          { name: "Meublé", type: "boolean" },
          { name: "Salle de bain privée", type: "boolean" }
        ]
      },
      {
        id: "studios",
        name: "Studios",
        attributes: [
          { name: "Surface", type: "number", required: true, unit: "m²" },
          { name: "Meublé", type: "boolean" },
          { name: "Étage", type: "number" }
        ]
      },
      {
        id: "appartements-meubles",
        name: "Appartements meublés",
        attributes: [
          { name: "Nombre de pièces", type: "number", required: true },
          { name: "Surface", type: "number", required: true, unit: "m²" },
          { name: "Étage", type: "number" }
        ]
      }
    ]
  },
  {
    id: "electromenager",
    name: "Électroménager",
    icon: "Tv",
    subcategories: [
      {
        id: "cuisinieres",
        name: "Cuisinières",
        attributes: [
          { name: "Type", type: "select", options: ["Gaz", "Électrique", "Mixte"], required: true },
          { name: "Nombre de feux", type: "number", required: true }
        ]
      },
      {
        id: "refrigerateurs",
        name: "Réfrigérateurs",
        attributes: [
          { name: "Volume", type: "number", required: true, unit: "L" },
          { name: "Congélateur", type: "boolean" }
        ]
      },
      {
        id: "climatiseurs",
        name: "Climatiseurs",
        attributes: [
          { name: "Puissance", type: "number", required: true, unit: "BTU" },
          { name: "Type", type: "select", options: ["Split", "Mobile", "Window"], required: true }
        ]
      },
      {
        id: "machines-a-laver",
        name: "Machines à laver",
        attributes: [
          { name: "Capacité", type: "number", required: true, unit: "kg" },
          { name: "Type", type: "select", options: ["Frontale", "Top"], required: true }
        ]
      }
    ]
  },
  {
    id: "emploi",
    name: "Offres d'emploi",
    icon: "Briefcase",
    subcategories: [
      {
        id: "offres-emploi",
        name: "Offres d'emploi",
        attributes: [
          { name: "Type de contrat", type: "select", options: ["CDI", "CDD", "Stage", "Freelance"], required: true },
          { name: "Secteur", type: "select", options: ["IT", "Finance", "Marketing", "Vente"], required: true }
        ]
      },
      {
        id: "demandes-emploi",
        name: "Demandes d'emploi",
        attributes: [
          { name: "Niveau d'études", type: "select", options: ["Bac", "Bac+2", "Bac+3", "Bac+5"], required: true },
          { name: "Années d'expérience", type: "number", required: true }
        ]
      },
      {
        id: "formations",
        name: "Formations",
        attributes: [
          { name: "Domaine", type: "select", options: ["Informatique", "Langues", "Management", "Artisanat"], required: true },
          { name: "Durée", type: "number", required: true, unit: "heures" }
        ]
      }
    ]
  },
  {
    id: "services",
    name: "Services",
    icon: "HeartHandshake",
    subcategories: [
      {
        id: "covoiturage",
        name: "Covoiturage",
        attributes: [
          { name: "Départ", type: "text", required: true },
          { name: "Arrivée", type: "text", required: true },
          { name: "Date", type: "text", required: true }
        ]
      },
      {
        id: "cours-particuliers",
        name: "Cours particuliers",
        attributes: [
          { name: "Matière", type: "text", required: true },
          { name: "Niveau", type: "select", options: ["Primaire", "Collège", "Lycée", "Supérieur"], required: true }
        ]
      },
      {
        id: "evenements",
        name: "Événements",
        attributes: [
          { name: "Type", type: "select", options: ["Concert", "Théâtre", "Sport", "Conférence"], required: true },
          { name: "Date", type: "text", required: true }
        ]
      },
      {
        id: "menagere",
        name: "Ménagère",
        attributes: [
          { name: "Type", type: "select", options: ["Ménage", "Repassage", "Cuisine"], required: true },
          { name: "Fréquence", type: "select", options: ["Ponctuel", "Hebdomadaire", "Mensuel"], required: true }
        ]
      },
      {
        id: "livraison",
        name: "Livraison",
        attributes: [
          { name: "Type de véhicule", type: "select", options: ["Moto", "Voiture", "Camionnette"], required: true },
          { name: "Zone de livraison", type: "text", required: true }
        ]
      }
    ]
  },
  {
    id: "sports-loisirs",
    name: "Sports & Loisirs",
    icon: "Trophy",
    subcategories: [
      {
        id: "billeterie-films",
        name: "Billeterie Films",
        attributes: [
          { name: "Film", type: "text", required: true },
          { name: "Cinéma", type: "text", required: true },
          { name: "Date", type: "text", required: true }
        ]
      },
      {
        id: "series",
        name: "Séries",
        attributes: [
          { name: "Titre", type: "text", required: true },
          { name: "Genre", type: "select", options: ["Action", "Comédie", "Drame", "Science-fiction"], required: true },
          { name: "Format", type: "select", options: ["DVD", "Blu-ray", "Digital"], required: true }
        ]
      }
    ]
  }
];