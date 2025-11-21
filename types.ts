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
  timestamp: number;
}

export interface BurritoEntry {
  id: string;
  dateStr: string;
  formattedDate: string;
  hasBurritos: boolean;
  timestamp: number;
}

export type EntryType = 'menu' | 'advice' | 'burritos';