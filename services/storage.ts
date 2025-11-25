
import { supabase } from './supabase';
import { MenuEntry, AdviceEntry, BurritoEntry, DishPhotoEntry, DailyStatusEntry } from '../types';

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
  photoUrl: data.photo_url,
  timestamp: data.timestamp
});

const mapBurritoFromDB = (data: any): BurritoEntry => ({
  id: data.id,
  dateStr: data.date_str,
  formattedDate: data.formatted_date,
  hasBurritos: data.has_burritos,
  timestamp: data.timestamp
});

const mapDailyStatusFromDB = (data: any): DailyStatusEntry => ({
  id: data.id,
  dateStr: data.date_str,
  formattedDate: data.formatted_date,
  bengels: data.bengels,
  lekkerVreten: data.lekker_vreten,
  korvel: data.korvel,
  visdag: data.visdag,
  burritos: data.burritos,
  timestamp: data.timestamp
});

const mapPhotoFromDB = (data: any): DishPhotoEntry => ({
  id: data.id,
  dateStr: data.date_str,
  dishSection: data.dish_section,
  photoUrl: data.photo_url,
  uploaderName: data.uploader_name,
  comment: data.comment,
  rating: data.rating || 0, // Default to 0 if null (legacy support)
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

// Deprecated but kept for type safety if needed elsewhere
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

export const getLatestDailyStatus = async (): Promise<DailyStatusEntry | null> => {
  const { data, error } = await supabase
    .from('daily_status')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data ? mapDailyStatusFromDB(data) : null;
};

export const getDishPhotos = async (dateStr: string): Promise<DishPhotoEntry[]> => {
  const { data, error } = await supabase
    .from('dish_photos')
    .select('*')
    .eq('date_str', dateStr)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
  return (data || []).map(mapPhotoFromDB);
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

export const saveAdvice = async (advice: string, photoUrl?: string) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('advices')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        advice: advice,
        photo_url: photoUrl,
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

export const saveDailyStatus = async (
  bengels: boolean | null, 
  lekkerVreten: boolean | null, 
  korvel: boolean | null,
  visdag: boolean | null,
  burritos: boolean | null
) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('daily_status')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        bengels: bengels,
        lekker_vreten: lekkerVreten,
        korvel: korvel,
        visdag: visdag,
        burritos: burritos,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving daily status:", error);
    throw error;
  }
};

export const uploadPhoto = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-photos')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('menu-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const saveDishPhoto = async (dishSection: string, photoUrl: string, uploaderName: string, comment: string, rating: number) => {
  const { dateStr, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('dish_photos')
    .insert([
      {
        date_str: dateStr,
        dish_section: dishSection,
        photo_url: photoUrl,
        uploader_name: uploaderName,
        comment: comment,
        rating: rating,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving photo metadata:", error);
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

export const subscribeToDailyStatusUpdates = (callback: () => void) => {
  return supabase
    .channel('daily_status_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_status' }, callback)
    .subscribe();
};

export const subscribeToPhotoUpdates = (callback: () => void) => {
  return supabase
    .channel('photos_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dish_photos' }, callback)
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
