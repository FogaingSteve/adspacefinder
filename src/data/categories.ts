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
          {
            name: "Surface",
            type: "number",
            required: true,
            unit: "m²"
          },
          {
            name: "Nombre de pièces",
            type: "number",
            required: true
          },
          {
            name: "Étage",
            type: "number"
          },
          {
            name: "Ascenseur",
            type: "boolean"
          },
          {
            name: "État",
            type: "select",
            options: ["Neuf", "Bon état", "À rénover"],
            required: true
          }
        ]
      },
      {
        id: "location-appartement",
        name: "Location appartement",
        attributes: [
          {
            name: "Surface",
            type: "number",
            required: true,
            unit: "m²"
          },
          {
            name: "Nombre de pièces",
            type: "number",
            required: true
          },
          {
            name: "Meublé",
            type: "boolean"
          },
          {
            name: "Charges comprises",
            type: "boolean"
          }
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
          {
            name: "Marque",
            type: "select",
            options: ["Renault", "Peugeot", "Citroën", "BMW", "Audi", "Mercedes"],
            required: true
          },
          {
            name: "Année",
            type: "number",
            required: true
          },
          {
            name: "Kilométrage",
            type: "number",
            required: true,
            unit: "km"
          },
          {
            name: "Carburant",
            type: "select",
            options: ["Essence", "Diesel", "Électrique", "Hybride"],
            required: true
          },
          {
            name: "Boîte de vitesse",
            type: "select",
            options: ["Manuelle", "Automatique"],
            required: true
          }
        ]
      },
      {
        id: "motos",
        name: "Motos",
        attributes: [
          {
            name: "Marque",
            type: "select",
            options: ["Yamaha", "Honda", "Kawasaki", "BMW", "Ducati"],
            required: true
          },
          {
            name: "Cylindrée",
            type: "number",
            required: true,
            unit: "cc"
          }
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
          {
            name: "Type de contrat",
            type: "select",
            options: ["CDI", "CDD", "Intérim", "Stage", "Alternance"],
            required: true
          },
          {
            name: "Secteur",
            type: "select",
            options: ["Informatique", "Commerce", "BTP", "Santé", "Transport"],
            required: true
          },
          {
            name: "Télétravail possible",
            type: "boolean"
          }
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
          {
            name: "Type",
            type: "select",
            options: ["Homme", "Femme", "Enfant"],
            required: true
          },
          {
            name: "Taille",
            type: "select",
            options: ["XS", "S", "M", "L", "XL", "XXL"],
            required: true
          },
          {
            name: "État",
            type: "select",
            options: ["Neuf", "Très bon état", "Bon état", "Satisfaisant"],
            required: true
          }
        ]
      },
      {
        id: "chaussures",
        name: "Chaussures",
        attributes: [
          {
            name: "Type",
            type: "select",
            options: ["Homme", "Femme", "Enfant"],
            required: true
          },
          {
            name: "Pointure",
            type: "number",
            required: true
          }
        ]
      }
    ]
  }
];