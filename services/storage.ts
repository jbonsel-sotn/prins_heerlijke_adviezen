import { MenuEntry, AdviceEntry } from '../types';

const MENU_KEY = 'prins_heerlijk_menus';
const ADVICE_KEY = 'prins_heerlijk_advices';

export const getMenus = (): MenuEntry[] => {
  try {
    const data = localStorage.getItem(MENU_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load menus", e);
    return [];
  }
};

export const saveMenu = (items: string) => {
  const menus = getMenus();
  const now = new Date();
  
  // Format Dutch date
  const formattedDate = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // ISO string for data logic (YYYY-MM-DD)
  const dateStr = now.toISOString().split('T')[0];

  const newEntry: MenuEntry = {
    id: crypto.randomUUID(),
    dateStr,
    formattedDate,
    items,
    timestamp: Date.now()
  };

  const updatedMenus = [newEntry, ...menus];
  localStorage.setItem(MENU_KEY, JSON.stringify(updatedMenus));
  // Dispatch event for live updates across components if needed (though we might use Context or simple refetch)
  window.dispatchEvent(new Event('storage-update'));
};

export const getAdvices = (): AdviceEntry[] => {
  try {
    const data = localStorage.getItem(ADVICE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load advices", e);
    return [];
  }
};

export const saveAdvice = (advice: string) => {
  const advices = getAdvices();
  const now = new Date();
  
  const formattedDate = now.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const dateStr = now.toISOString().split('T')[0];

  const newEntry: AdviceEntry = {
    id: crypto.randomUUID(),
    dateStr,
    formattedDate,
    advice,
    timestamp: Date.now()
  };

  const updatedAdvices = [newEntry, ...advices];
  localStorage.setItem(ADVICE_KEY, JSON.stringify(updatedAdvices));
  window.dispatchEvent(new Event('storage-update'));
};

export const getLatestMenu = (): MenuEntry | null => {
  const menus = getMenus();
  if (menus.length === 0) return null;
  // Sort by timestamp desc just in case
  return menus.sort((a, b) => b.timestamp - a.timestamp)[0];
};

export const getLatestAdvice = (): AdviceEntry | null => {
  const advices = getAdvices();
  if (advices.length === 0) return null;
  return advices.sort((a, b) => b.timestamp - a.timestamp)[0];
};

// Get unique history (latest per day)
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
