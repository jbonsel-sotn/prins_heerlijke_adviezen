
export interface MenuEntry {
  id: string;
  dateStr: string; // Format: YYYY-MM-DD for sorting/filtering
  formattedDate: string; // Display format
  items: string;
  timestamp: number;
}

export interface AdviceEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  advice: string;
  photoUrl?: string;
  timestamp: number;
}

export interface AiAdviceEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  advice: string;
  timestamp: number;
}

export interface MartAdviceEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  advice: string;
  timestamp: number;
}

export interface BurritoEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  hasBurritos: boolean;
  timestamp: number;
}

export interface DailyStatusEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  bengels: boolean | null;
  lekkerVreten: boolean | null;
  korvel: boolean | null;
  visdag: boolean | null;    // Nieuw
  burritos: boolean | null;  // Nieuw (verplaatst van eigen tabel naar hier)
  timestamp: number;
}

export interface DishPhotoEntry {
  id: string;
  dateStr: string;
  dishSection: string; // e.g., "Gerecht 1", "Gerecht 2", "Soep"
  photoUrl: string;
  uploaderName: string;
  comment?: string;
  rating: number;
  timestamp: number;
}

export interface KorvelReviewEntry {
  id: string;
  establishment: string;
  expert: string;
  scores: {
    grimmigheid: number;
    smaak: number;
    versheid: number;
    snelheid: number;
    service: number;
    hygiene: number;
    taal: number;
    prijs: number;
    temperatuur: number;
    verpakking: number;
  };
  totalScore: number;
  order: string;
  dateStr: string;
  photoUrl?: string; // Added photo support
  timestamp: number;
}

export type EntryType = 'menu' | 'advice' | 'ai_advice' | 'mart_advice' | 'burritos' | 'other' | 'korvel';