import { supabase } from './supabase';
import { MenuEntry, AdviceEntry, BurritoEntry } from '../types';

// --- Mappers ---
// Map database snake_case to TypeScript camelCase

const mapMenuFromDB = (data: any): MenuEntry => ({
  id: data.id,
  dateStr: data.date_str,
  formattedDate: data.formatted_date,
  items: data.items,
  timestamp: data.timestamp
});

const mapAdviceFromDB = (data: any): AdviceEntry => ({
  id: data.id,
  dateStr: data.date_str,
  formattedDate: data.formatted_date,
  advice: data.advice,
  timestamp: data.timestamp
});

const mapBurritoFromDB = (data: any): BurritoEntry => ({
  id: data.id,
  dateStr: data.date_str,
  formattedDate: data.formatted_date,
  hasBurritos: data.has_burritos,
  timestamp: data.timestamp
});

// --- Fetch Functions ---

export const getMenus = async (): Promise<MenuEntry[]> => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) {
    console.error("Error fetching menus:", error);
    return [];
  }
  return (data || []).map(mapMenuFromDB);
};

export const getAdvices = async (): Promise<AdviceEntry[]> => {
  const { data, error } = await supabase
    .from('advices')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching advices:", error);
    return [];
  }
  return (data || []).map(mapAdviceFromDB);
};

export const getLatestMenu = async (): Promise<MenuEntry | null> => {
  const { data, error } = await supabase
    .from('menus')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data ? mapMenuFromDB(data) : null;
};

export const getLatestAdvice = async (): Promise<AdviceEntry | null> => {
  const { data, error } = await supabase
    .from('advices')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data ? mapAdviceFromDB(data) : null;
};

export const getLatestBurritoStatus = async (): Promise<BurritoEntry | null> => {
  const { data, error } = await supabase
    .from('burritos')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data ? mapBurritoFromDB(data) : null;
};

// --- Save Functions ---

const getTimestampAndDate = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  // Use Europe/Amsterdam time for the dateStr to ensure correct day boundary
  const todayNL = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Amsterdam"}));
  const yyyy = todayNL.getFullYear();
  const mm = String(todayNL.getMonth() + 1).padStart(2, '0');
  const dd = String(todayNL.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  
  const timestamp = Date.now();
  return { dateStr, formattedDate, timestamp };
};

export const saveMenu = async (items: string) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('menus')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        items: items,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving menu:", error);
    throw error;
  }
};

export const saveAdvice = async (advice: string) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('advices')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        advice: advice,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving advice:", error);
    throw error;
  }
};

export const saveBurritoStatus = async (hasBurritos: boolean) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('burritos')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        has_burritos: hasBurritos,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving burrito status:", error);
    throw error;
  }
};

// --- Realtime Subscriptions ---

export const subscribeToMenuUpdates = (callback: () => void) => {
  return supabase
    .channel('menus_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'menus' }, callback)
    .subscribe();
};

export const subscribeToAdviceUpdates = (callback: () => void) => {
  return supabase
    .channel('advices_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'advices' }, callback)
    .subscribe();
};

export const subscribeToBurritoUpdates = (callback: () => void) => {
  return supabase
    .channel('burritos_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'burritos' }, callback)
    .subscribe();
};

// --- Helper ---

export const getUniqueHistory = <T extends MenuEntry | AdviceEntry>(items: T[]): T[] => {
  const map = new Map<string, T>();
  
  // Sort by timestamp ascending, so later entries overwrite earlier ones in the map
  const sorted = [...items].sort((a, b) => a.timestamp - b.timestamp);
  
  sorted.forEach(item => {
    map.set(item.dateStr, item);
  });

  // Return values sorted by date desc
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
};