
export interface WeatherData {
  locationName: string;
  temperature: string;
  condition: string;
  landmark: string;
  description: string;
  sourceUrl?: string;
  isRainy?: boolean; // Helper for animation
  isSunny?: boolean; // Helper for animation
}

export interface OutfitData {
  hat?: string;
  top?: string;
  bottom?: string;
  outerwear?: string;
  shoes?: string;
  accessories?: string;
  dress?: string;
}

// Holds the image URLs for the generated outfit items
export interface OutfitImages {
  hat?: string;
  top?: string;
  bottom?: string;
  outerwear?: string;
  shoes?: string;
  accessories?: string;
  dress?: string;
}

export enum Gender {
  Female = '女性',
  Male = '男性',
  NonBinary = '通用'
}

// Changed to string to support custom inputs
export type HairLength = string; 
export type HairColor = string;
export type SkinTone = '白皙' | '正常' | '小麦色' | '深色';

export interface UserStats {
  gender: Gender;
  age: number;
  hairLength: HairLength;
  hairColor: HairColor;
  skinTone: SkinTone;
  weight: '偏瘦' | '适中' | '偏胖';
  uploadedImage?: string | null; // Base64 string of user uploaded image
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
}

export type ThemeName = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface ThemeColors {
  bgMain: string;
  bgCard: string;
  border: string;
  accent: string;
  button: string;
  text: string;
  woodLight: string; // Also used as secondary accent
  woodDark: string; // Also used as secondary border
  handle: string;    // New: Color for wardrobe handles
  sky: string;       // New: Background color for avatar/hero section
  patternClass: string; // CSS class for background pattern
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  Spring: {
    bgMain: '#FFD1DC', // Soft Pastel Pink
    bgCard: '#FFF0F5', // Lavender Blush
    border: '#8B4513', // Saddle Brown (More contrast)
    accent: '#FFB7C5', // Cherry Blossom
    button: '#FF69B4', // Hot Pink
    text: '#5D3A3A',   // Dark Rose Brown
    woodLight: '#FFC0CB', // Pink Wood
    woodDark: '#CD5C5C',  // Darker Pink Wood
    handle: '#FFD700',    // Gold Handle
    sky: '#FFE4E1',       // Misty Rose Sky
    patternClass: 'pattern-spring'
  },
  Summer: {
    bgMain: '#87CEEB', // Sky Blue
    bgCard: '#F0F8FF', // Alice Blue
    border: '#191970', // Midnight Blue
    accent: '#00BFFF', // Deep Sky Blue
    button: '#1E90FF', // Dodger Blue
    text: '#002366',   // Deep Navy
    woodLight: '#B0E0E6', // Powder Blue
    woodDark: '#4682B4',  // Steel Blue
    handle: '#C0C0C0',    // Silver Handle
    sky: '#87CEFA',       // Light Sky Blue
    patternClass: 'pattern-summer'
  },
  Autumn: {
    bgMain: '#D2B48C', // Tan
    bgCard: '#FFF8DC', // Cornsilk
    border: '#3E2723', // Dark Espresso
    accent: '#CD853F', // Peru
    button: '#A0522D', // Sienna
    text: '#3E2723',   // Dark Espresso
    woodLight: '#DEB887', // Burlywood
    woodDark: '#8B4513',  // Saddle Brown
    handle: '#B87333',    // Copper Handle
    sky: '#FFE4B5',       // Moccasin Sky
    patternClass: 'pattern-autumn'
  },
  Winter: {
    bgMain: '#B0C4DE', // Light Steel Blue
    bgCard: '#FFFFFF', // White
    border: '#2F4F4F', // Dark Slate Gray
    accent: '#E0FFFF', // Light Cyan
    button: '#778899', // Light Slate Gray
    text: '#1C1C1C',   // Almost Black
    woodLight: '#DCDCDC', // Gainsboro
    woodDark: '#708090',  // Slate Gray
    handle: '#4A4A4A',    // Iron Handle
    sky: '#F0FFFF',       // Azure Sky
    patternClass: 'pattern-winter'
  }
};
