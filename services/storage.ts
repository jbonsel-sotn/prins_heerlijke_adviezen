
import { supabase } from './supabase';
import { MenuEntry, AdviceEntry, AiAdviceEntry, MartAdviceEntry, BurritoEntry, DishPhotoEntry, DailyStatusEntry, KorvelReviewEntry } from '../types';

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

const mapAiAdviceFromDB = (data: any): AiAdviceEntry => ({
  id: data.id,
  dateStr: data.date_str,
  formattedDate: data.formatted_date,
  advice: data.advice,
  timestamp: data.timestamp
});

const mapMartAdviceFromDB = (data: any): MartAdviceEntry => ({
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

const mapKorvelReviewFromDB = (data: any): KorvelReviewEntry => ({
  id: data.id,
  establishment: data.establishment,
  expert: data.expert,
  scores: data.scores, // Assuming JSONB or similar structure
  totalScore: data.total_score,
  order: data.order_details,
  dateStr: data.date_str,
  photoUrl: data.photo_url,
  timestamp: data.timestamp
});

// --- Historical Data (Imported from HTML) ---
const HISTORY_REVIEWS: KorvelReviewEntry[] = [
  { id: 'h1', establishment: 'Texas', expert: 'Tootje', scores: { grimmigheid: 7.5, smaak: 6, versheid: 6, snelheid: 6, service: 6, hygiene: 2, taal: 7, prijs: 6, temperatuur: 8, verpakking: 4 }, totalScore: 58.5, order: 'Kapsalon', dateStr: 'Oud', timestamp: 0 },
  { id: 'h2', establishment: 'Texas', expert: 'Smart', scores: { grimmigheid: 7, smaak: 6, versheid: 4, snelheid: 8, service: 5, hygiene: 2, taal: 6, prijs: 7, temperatuur: 8, verpakking: 5 }, totalScore: 58, order: 'Döner box', dateStr: 'Oud', timestamp: 0 },
  { id: 'h3', establishment: 'Texas', expert: 'Ries', scores: { grimmigheid: 8, smaak: 6.5, versheid: 6, snelheid: 5, service: 6, hygiene: 2, taal: 7, prijs: 7, temperatuur: 8, verpakking: 6 }, totalScore: 61.5, order: 'Broodje kipdoner', dateStr: 'Oud', timestamp: 0 },
  { id: 'h4', establishment: 'Texas', expert: 'Hanja', scores: { grimmigheid: 8.5, smaak: 6, versheid: 4, snelheid: 4, service: 6, hygiene: 2, taal: 7, prijs: 6, temperatuur: 8, verpakking: 5 }, totalScore: 56.5, order: 'Turkse pizza kipdoner', dateStr: 'Oud', timestamp: 0 },
  { id: 'h5', establishment: 'Texas', expert: 'James Bond', scores: { grimmigheid: 9, smaak: 7, versheid: 3, snelheid: 1, service: 5, hygiene: 4, taal: 7, prijs: 6, temperatuur: 8, verpakking: 6 }, totalScore: 56, order: 'Dürüm Döner', dateStr: 'Oud', timestamp: 0 },
  
  { id: 'h6', establishment: 'Kabila', expert: 'Tootje', scores: { grimmigheid: 6.5, smaak: 8, versheid: 9, snelheid: 7, service: 8, hygiene: 6, taal: 7, prijs: 7, temperatuur: 9, verpakking: 6 }, totalScore: 73.5, order: 'Broodje shoarma', dateStr: 'Oud', timestamp: 0 },
  { id: 'h7', establishment: 'Kabila', expert: 'Smart', scores: { grimmigheid: 5.5, smaak: 8, versheid: 8, snelheid: 6, service: 6, hygiene: 4, taal: 5, prijs: 6, temperatuur: 8, verpakking: 7 }, totalScore: 63.5, order: 'Broodje hete kip met knoflooksaus', dateStr: 'Oud', timestamp: 0 },
  { id: 'h8', establishment: 'Kabila', expert: 'Ries', scores: { grimmigheid: 7, smaak: 9, versheid: 8, snelheid: 6, service: 7.5, hygiene: 6, taal: 6, prijs: 7, temperatuur: 8, verpakking: 7 }, totalScore: 71.5, order: 'Broodje hete kip', dateStr: 'Oud', timestamp: 0 },

  { id: 'h9', establishment: 'Shahba', expert: 'Tootje', scores: { grimmigheid: 9, smaak: 8, versheid: 5, snelheid: 6, service: 5, hygiene: 4, taal: 8, prijs: 7, temperatuur: 8, verpakking: 8 }, totalScore: 68, order: 'Kapsalon met lamsvlees', dateStr: 'Oud', timestamp: 0 },
  { id: 'h10', establishment: 'Shahba', expert: 'Smart', scores: { grimmigheid: 9, smaak: 7, versheid: 6, snelheid: 6, service: 3, hygiene: 2, taal: 8, prijs: 6, temperatuur: 8, verpakking: 8 }, totalScore: 63, order: 'Durüm döner', dateStr: 'Oud', timestamp: 0 },
  { id: 'h11', establishment: 'Shahba', expert: 'Ries', scores: { grimmigheid: 9.5, smaak: 8, versheid: 6, snelheid: 5, service: 5, hygiene: 4, taal: 8, prijs: 7, temperatuur: 8, verpakking: 7 }, totalScore: 67.5, order: 'Broodje kalfs döner', dateStr: 'Oud', timestamp: 0 },

  { id: 'h12', establishment: 'Hicret', expert: 'Tootje', scores: { grimmigheid: 5.5, smaak: 8, versheid: 8, snelheid: 8.5, service: 6.5, hygiene: 7, taal: 5.5, prijs: 7, temperatuur: 7, verpakking: 8 }, totalScore: 71, order: 'Turkse pizza kipdöner en borek feta spinazie', dateStr: 'Oud', timestamp: 0 },
  { id: 'h13', establishment: 'Hicret', expert: 'Smart', scores: { grimmigheid: 4, smaak: 8.5, versheid: 8, snelheid: 9, service: 8, hygiene: 8, taal: 5, prijs: 8, temperatuur: 8, verpakking: 7 }, totalScore: 73.5, order: 'Turkse pizza kipdöner met kaas', dateStr: 'Oud', timestamp: 0 },
  { id: 'h14', establishment: 'Hicret', expert: 'Ries', scores: { grimmigheid: 5, smaak: 8, versheid: 8, snelheid: 9, service: 7, hygiene: 7, taal: 5, prijs: 8, temperatuur: 7, verpakking: 7 }, totalScore: 71, order: 'Turkes pizza kipdoner', dateStr: 'Oud', timestamp: 0 },

  { id: 'h15', establishment: "Tosti's Corner", expert: 'Tootje', scores: { grimmigheid: 3, smaak: 8, versheid: 8, snelheid: 8, service: 7, hygiene: 8, taal: 5, prijs: 4, temperatuur: 7, verpakking: 6 }, totalScore: 64, order: 'Tosti grillworst kip + chicken strips', dateStr: 'Oud', timestamp: 0 },
  { id: 'h16', establishment: "Tosti's Corner", expert: 'Smart', scores: { grimmigheid: 3, smaak: 8, versheid: 8, snelheid: 7.5, service: 7, hygiene: 8, taal: 6, prijs: 8, temperatuur: 7.5, verpakking: 6 }, totalScore: 69, order: 'Panini hete kip', dateStr: 'Oud', timestamp: 0 },
  { id: 'h17', establishment: "Tosti's Corner", expert: 'Ries', scores: { grimmigheid: 2, smaak: 7.5, versheid: 8, snelheid: 9, service: 7, hygiene: 8, taal: 5, prijs: 6.5, temperatuur: 7, verpakking: 6 }, totalScore: 66, order: 'Mexican tosti + chicken strips', dateStr: 'Oud', timestamp: 0 },

  { id: 'h18', establishment: 'Kabila ronde 2', expert: 'Tootje', scores: { grimmigheid: 5, smaak: 9, versheid: 9, snelheid: 7, service: 10, hygiene: 8, taal: 6, prijs: 6, temperatuur: 9, verpakking: 8 }, totalScore: 77, order: 'Kapsalon Kabila (kip en garnaal)', dateStr: 'Oud', timestamp: 0 },
  { id: 'h19', establishment: 'Kabila ronde 2', expert: 'Smart', scores: { grimmigheid: 3, smaak: 9, versheid: 8, snelheid: 8, service: 9.5, hygiene: 7.5, taal: 5, prijs: 6, temperatuur: 9, verpakking: 7 }, totalScore: 72, order: 'Broodje Kabila', dateStr: 'Oud', timestamp: 0 },
  { id: 'h20', establishment: 'Kabila ronde 2', expert: 'Ries', scores: { grimmigheid: 4, smaak: 9, versheid: 8, snelheid: 8, service: 9, hygiene: 7, taal: 6, prijs: 6, temperatuur: 8, verpakking: 7 }, totalScore: 72, order: 'Broodje kabila', dateStr: 'Oud', timestamp: 0 },
  { id: 'h21', establishment: 'Kabila ronde 2', expert: 'Hanja', scores: { grimmigheid: 3, smaak: 8, versheid: 8, snelheid: 7, service: 9.5, hygiene: 7, taal: 6.5, prijs: 6, temperatuur: 8, verpakking: 6.5 }, totalScore: 69.5, order: 'Broodje hete kip', dateStr: 'Oud', timestamp: 0 },
  { id: 'h22', establishment: 'Kabila ronde 2', expert: 'James Bond', scores: { grimmigheid: 4, smaak: 8.5, versheid: 9, snelheid: 8, service: 10, hygiene: 6.5, taal: 5, prijs: 5, temperatuur: 8, verpakking: 7 }, totalScore: 71, order: 'Broodje hete kip', dateStr: 'Oud', timestamp: 0 },

  { id: 'h23', establishment: 'Hicret ronde 2', expert: 'Tootje', scores: { grimmigheid: 5.5, smaak: 8, versheid: 8, snelheid: 10, service: 7, hygiene: 7, taal: 5, prijs: 7, temperatuur: 7, verpakking: 8 }, totalScore: 72.5, order: 'Turkse pizza kipdoner en kaas', dateStr: 'Oud', timestamp: 0 },
  { id: 'h24', establishment: 'Hicret ronde 2', expert: 'Smart', scores: { grimmigheid: 4, smaak: 8, versheid: 8, snelheid: 9, service: 7, hygiene: 7.5, taal: 5, prijs: 8, temperatuur: 8, verpakking: 7 }, totalScore: 71.5, order: 'Turkse pizza kaas', dateStr: 'Oud', timestamp: 0 },
  { id: 'h25', establishment: 'Hicret ronde 2', expert: 'Ries', scores: { grimmigheid: 4, smaak: 8, versheid: 8, snelheid: 9.5, service: 7, hygiene: 7, taal: 6, prijs: 8, temperatuur: 8, verpakking: 6 }, totalScore: 71.5, order: 'Turkse pizza kipdoner en kaas', dateStr: 'Oud', timestamp: 0 },
  { id: 'h26', establishment: 'Hicret ronde 2', expert: 'Hanja', scores: { grimmigheid: 3, smaak: 8, versheid: 8, snelheid: 9, service: 7, hygiene: 7, taal: 7, prijs: 8, temperatuur: 7, verpakking: 6 }, totalScore: 70, order: 'Turkse pizza kipdoner', dateStr: 'Oud', timestamp: 0 },
  { id: 'h27', establishment: 'Hicret ronde 2', expert: 'James Bond', scores: { grimmigheid: 7, smaak: 8, versheid: 5, snelheid: 8, service: 7, hygiene: 6, taal: 6, prijs: 9, temperatuur: 8, verpakking: 6 }, totalScore: 70, order: 'Turkse pizza kipdoner', dateStr: 'Oud', timestamp: 0 },

  { id: 'h28', establishment: "Lunchroom 't Laar", expert: 'Tootje', scores: { grimmigheid: 1, smaak: 10, versheid: 8, snelheid: 7, service: 9, hygiene: 8, taal: 2, prijs: 8, temperatuur: 9, verpakking: 8 }, totalScore: 70, order: 'Broodje biefstukpuntjes en een frikandel speciaaal', dateStr: 'Oud', timestamp: 0 },
  { id: 'h29', establishment: "Lunchroom 't Laar", expert: 'Smart', scores: { grimmigheid: 1, smaak: 9.5, versheid: 9, snelheid: 6, service: 8.5, hygiene: 8, taal: 3, prijs: 7, temperatuur: 9, verpakking: 7 }, totalScore: 68, order: 'Bruin broodje biefstukpuntjes en een mexicano', dateStr: 'Oud', timestamp: 0 },
  { id: 'h30', establishment: "Lunchroom 't Laar", expert: 'Ries', scores: { grimmigheid: 2, smaak: 9, versheid: 8, snelheid: 7, service: 7.5, hygiene: 8, taal: 2, prijs: 7, temperatuur: 7, verpakking: 9 }, totalScore: 66.5, order: 'Bruin broodje spicy biefstukpuntjes', dateStr: 'Oud', timestamp: 0 },
  { id: 'h31', establishment: "Lunchroom 't Laar", expert: 'Hanja', scores: { grimmigheid: 1, smaak: 10, versheid: 9, snelheid: 6, service: 7.5, hygiene: 8, taal: 3, prijs: 8, temperatuur: 9, verpakking: 9 }, totalScore: 70.5, order: 'Panini kaas tomaat pesto', dateStr: 'Oud', timestamp: 0 },
  { id: 'h32', establishment: "Lunchroom 't Laar", expert: 'James Bond', scores: { grimmigheid: 2, smaak: 6.5, versheid: 8, snelheid: 6, service: 9, hygiene: 8, taal: 2, prijs: 8, temperatuur: 8, verpakking: 7 }, totalScore: 64.5, order: 'Panini kip teriyaki ', dateStr: 'Oud', timestamp: 0 },

  { id: 'h33', establishment: 'Tasty Saigon', expert: 'Tootje', scores: { grimmigheid: 2, smaak: 9, versheid: 7, snelheid: 6, service: 8, hygiene: 9, taal: 8, prijs: 3, temperatuur: 10, verpakking: 6 }, totalScore: 68, order: "Garnaal gehakt loempia's en Bahn Mi speciaal", dateStr: 'Oud', timestamp: 0 },
  { id: 'h34', establishment: 'Tasty Saigon', expert: 'Smart', scores: { grimmigheid: 2, smaak: 8, versheid: 7, snelheid: 6, service: 7, hygiene: 9, taal: 8, prijs: 4, temperatuur: 7, verpakking: 6 }, totalScore: 64, order: 'Loempia Gehakt, Gehakt garnaal en Kip', dateStr: 'Oud', timestamp: 0 },
  { id: 'h35', establishment: 'Tasty Saigon', expert: 'James Bond', scores: { grimmigheid: 3, smaak: 7, versheid: 7, snelheid: 6, service: 8, hygiene: 8, taal: 7, prijs: 3, temperatuur: 8, verpakking: 7 }, totalScore: 64, order: 'Loempia Gehakt, Gehakt garnaal en Kip', dateStr: 'Oud', timestamp: 0 },
];

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

export const getAiAdvices = async (): Promise<AiAdviceEntry[]> => {
  const { data, error } = await supabase
    .from('ai_advices')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching AI advices:", error);
    return [];
  }
  return (data || []).map(mapAiAdviceFromDB);
};

export const getMartAdvices = async (): Promise<MartAdviceEntry[]> => {
  const { data, error } = await supabase
    .from('mart_advices')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching Mart advices:", error);
    return [];
  }
  return (data || []).map(mapMartAdviceFromDB);
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

export const getLatestAiAdvice = async (): Promise<AiAdviceEntry | null> => {
  const { data, error } = await supabase
    .from('ai_advices')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data ? mapAiAdviceFromDB(data) : null;
};

export const getLatestMartAdvice = async (): Promise<MartAdviceEntry | null> => {
  const { data, error } = await supabase
    .from('mart_advices')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data ? mapMartAdviceFromDB(data) : null;
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

export const getAllDishPhotos = async (): Promise<DishPhotoEntry[]> => {
  const { data, error } = await supabase
    .from('dish_photos')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching all photos:", error);
    return [];
  }
  return (data || []).map(mapPhotoFromDB);
};

export const getKorvelReviews = async (): Promise<KorvelReviewEntry[]> => {
  const { data, error } = await supabase
    .from('korvel_reviews')
    .select('*')
    .order('timestamp', { ascending: false });

  let dbReviews: KorvelReviewEntry[] = [];
  if (!error && data) {
    dbReviews = data.map(mapKorvelReviewFromDB);
  }

  // Merge history reviews and DB reviews
  return [...dbReviews, ...HISTORY_REVIEWS];
};

export const getUniqueEstablishments = async (): Promise<string[]> => {
  const reviews = await getKorvelReviews();
  const names = new Set(reviews.map(r => r.establishment));
  return Array.from(names).sort();
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

export const saveAiAdvice = async (advice: string) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('ai_advices')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        advice: advice,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving AI advice:", error);
    throw error;
  }
};

export const saveMartAdvice = async (advice: string) => {
  const { dateStr, formattedDate, timestamp } = getTimestampAndDate();

  const { error } = await supabase
    .from('mart_advices')
    .insert([
      { 
        date_str: dateStr,
        formatted_date: formattedDate,
        advice: advice,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving Mart advice:", error);
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

export const saveKorvelReview = async (
  establishment: string,
  expert: string,
  scores: KorvelReviewEntry['scores'],
  order: string,
  photoUrl?: string
) => {
  const { dateStr, timestamp } = getTimestampAndDate();
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const { error } = await supabase
    .from('korvel_reviews')
    .insert([
      {
        establishment,
        expert,
        scores,
        total_score: totalScore,
        order_details: order,
        date_str: dateStr,
        photo_url: photoUrl,
        timestamp: timestamp
      }
    ]);

  if (error) {
    console.error("Error saving korvel review:", error);
    throw error;
  }
};

// Helper: Compress Image to max 1200px width and 70% JPEG quality
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, 'image/jpeg', 0.7); // 70% quality
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const uploadPhoto = async (file: File): Promise<string> => {
  try {
    // Compress image before upload
    const compressedBlob = await compressImage(file);
    const fileExt = 'jpg'; // We force jpg conversion
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-photos')
      .upload(filePath, compressedBlob, { contentType: 'image/jpeg' });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('menu-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
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

export const subscribeToAiAdviceUpdates = (callback: () => void) => {
  return supabase
    .channel('ai_advices_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_advices' }, callback)
    .subscribe();
};

export const subscribeToMartAdviceUpdates = (callback: () => void) => {
  return supabase
    .channel('mart_advices_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mart_advices' }, callback)
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

export const subscribeToKorvelUpdates = (callback: () => void) => {
  return supabase
    .channel('korvel_channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'korvel_reviews' }, callback)
    .subscribe();
};

// --- Helper ---

export const getUniqueHistory = <T extends MenuEntry | AdviceEntry | AiAdviceEntry | MartAdviceEntry>(items: T[]): T[] => {
  const map = new Map<string, T>();
  
  // Sort by timestamp ascending, so later entries overwrite earlier ones in the map
  const sorted = [...items].sort((a, b) => a.timestamp - b.timestamp);
  
  sorted.forEach(item => {
    map.set(item.dateStr, item);
  });

  // Return values sorted by date desc
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
};