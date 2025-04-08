
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string = ''): string {
  if (!name || typeof name !== 'string') return '?';
  
  const names = name.trim().split(' ');
  if (names.length === 0) return '?';
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Format date relative to now (e.g. "il y a 2 heures")
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const pastDate = new Date(date);
  
  const diffMs = now.getTime() - pastDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return `il y a ${diffMonths} mois`;
  } else if (diffDays > 0) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffMins > 0) {
    return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  } else {
    return 'à l\'instant';
  }
}

// Format price with currency
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(price);
}
