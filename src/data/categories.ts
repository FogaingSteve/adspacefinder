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
    id: "immobilier",
    name: "Immobilier",
    icon: "Home",
    subcategories: [
      {
        id: "vente-appartement",
        name: "Vente appartement",
        attributes: [
          { name: "Surface", type: "number", required: true, unit: "m²" },
          { name: "Nombre de pièces", type: "number", required: true },
          { name: "Étage", type: "number" },
          { name: "Ascenseur", type: "boolean" },
          { name: "État", type: "select", options: ["Neuf", "Bon état", "À rénover"], required: true }
        ]
      },
      {
        id: "location-appartement",
        name: "Location appartement",
        attributes: [
          { name: "Surface", type: "number", required: true, unit: "m²" },
          { name: "Nombre de pièces", type: "number", required: true },
          { name: "Meublé", type: "boolean" },
          { name: "Charges comprises", type: "boolean" }
        ]
      },
      {
        id: "vente-maison",
        name: "Vente maison",
        attributes: [
          { name: "Surface habitable", type: "number", required: true, unit: "m²" },
          { name: "Surface terrain", type: "number", required: true, unit: "m²" },
          { name: "Nombre de pièces", type: "number", required: true },
          { name: "Piscine", type: "boolean" },
          { name: "Garage", type: "boolean" }
        ]
      },
      {
        id: "location-maison",
        name: "Location maison",
        attributes: [
          { name: "Surface habitable", type: "number", required: true, unit: "m²" },
          { name: "Surface terrain", type: "number", unit: "m²" },
          { name: "Nombre de pièces", type: "number", required: true },
          { name: "Meublé", type: "boolean" }
        ]
      }
    ]
  },
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
          { name: "Carburant", type: "select", options: ["Essence", "Diesel", "Électrique", "Hybride"], required: true },
          { name: "Boîte de vitesse", type: "select", options: ["Manuelle", "Automatique"], required: true }
        ]
      },
      {
        id: "motos",
        name: "Motos",
        attributes: [
          { name: "Marque", type: "select", options: ["Yamaha", "Honda", "Kawasaki", "BMW", "Ducati", "Harley-Davidson"], required: true },
          { name: "Cylindrée", type: "number", required: true, unit: "cc" },
          { name: "Année", type: "number", required: true },
          { name: "Kilométrage", type: "number", required: true, unit: "km" }
        ]
      },
      {
        id: "utilitaires",
        name: "Utilitaires",
        attributes: [
          { name: "Type", type: "select", options: ["Fourgon", "Camion", "Camionnette"], required: true },
          { name: "Charge utile", type: "number", unit: "kg", required: true },
          { name: "Année", type: "number", required: true }
        ]
      }
    ]
  },
  {
    id: "emploi",
    name: "Emploi",
    icon: "Briefcase",
    subcategories: [
      {
        id: "offres-emploi",
        name: "Offres d'emploi",
        attributes: [
          { name: "Type de contrat", type: "select", options: ["CDI", "CDD", "Intérim", "Stage", "Alternance"], required: true },
          { name: "Secteur", type: "select", options: ["Informatique", "Commerce", "BTP", "Santé", "Transport", "Education"], required: true },
          { name: "Télétravail possible", type: "boolean" },
          { name: "Expérience requise", type: "select", options: ["Débutant", "1-3 ans", "3-5 ans", "5-10 ans", "+10 ans"], required: true }
        ]
      },
      {
        id: "formations",
        name: "Formations",
        attributes: [
          { name: "Domaine", type: "select", options: ["Informatique", "Langues", "Management", "Artisanat", "Sport"], required: true },
          { name: "Niveau", type: "select", options: ["Débutant", "Intermédiaire", "Avancé"], required: true },
          { name: "Durée", type: "number", unit: "heures", required: true }
        ]
      }
    ]
  },
  {
    id: "mode",
    name: "Mode",
    icon: "ShoppingBag",
    subcategories: [
      {
        id: "vetements",
        name: "Vêtements",
        attributes: [
          { name: "Type", type: "select", options: ["Homme", "Femme", "Enfant"], required: true },
          { name: "Taille", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"], required: true },
          { name: "État", type: "select", options: ["Neuf", "Très bon état", "Bon état", "Satisfaisant"], required: true },
          { name: "Marque", type: "text" }
        ]
      },
      {
        id: "chaussures",
        name: "Chaussures",
        attributes: [
          { name: "Type", type: "select", options: ["Homme", "Femme", "Enfant"], required: true },
          { name: "Pointure", type: "number", required: true },
          { name: "État", type: "select", options: ["Neuf", "Très bon état", "Bon état", "Satisfaisant"], required: true },
          { name: "Marque", type: "text" }
        ]
      },
      {
        id: "accessoires",
        name: "Accessoires",
        attributes: [
          { name: "Type", type: "select", options: ["Sacs", "Bijoux", "Montres", "Ceintures", "Lunettes"], required: true },
          { name: "État", type: "select", options: ["Neuf", "Très bon état", "Bon état", "Satisfaisant"], required: true },
          { name: "Marque", type: "text" }
        ]
      }
    ]
  }
];