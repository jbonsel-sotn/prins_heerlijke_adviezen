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

export interface BurritoEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  hasBurritos: boolean;
  timestamp: number;
}

export interface DishPhotoEntry {
  id: string;
  dateStr: string;
  dishSection: string; // e.g., "Gerecht 1", "Gerecht 2", "Soep"
  photoUrl: string;
  uploaderName: string;
  comment?: string;
  timestamp: number;
}

export type EntryType = 'menu' | 'advice' | 'burritos';