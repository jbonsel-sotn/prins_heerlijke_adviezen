import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MenuEntry, AdviceEntry } from './types';
import * as storage from './services/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Coffee, Save, Calendar, Clock, Sparkles, History, Euro, Soup, Lock, Unlock, Loader2 } from 'lucide-react';

// --- Shared Components ---

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const Card = ({ title, children, icon: Icon, className = "" }: { title: string; children: React.ReactNode; icon?: any; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-xl border border-orange-50 overflow-hidden ${className}`}>
    <div className="bg-orange-50/50 p-5 md:p-6 border-b border-orange-100 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="text-orange-500 shrink-0" size={24} />}
        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 leading-tight">{title}</h2>
      </div>
    </div>
    <div className="p-5 md:p-6">
      {children}
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <Loader2 className="animate-spin text-orange-500" size={32} />
  </div>
);

// --- Pages ---

const HomePage = () => {
  const [menu, setMenu] = useState<MenuEntry | null>(null);
  const [advice, setAdvice] = useState<AdviceEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const loadData = async () => {
    const [latestMenu, latestAdvice] = await Promise.all([
      storage.getLatestMenu(),
      storage.getLatestAdvice()
    ]);
    setMenu(latestMenu);
    setAdvice(latestAdvice);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Setup Realtime subscriptions
    const menuSub = storage.subscribeToMenuUpdates(() => {
      loadData();
    });
    const adviceSub = storage.subscribeToAdviceUpdates(() => {
      loadData();
    });

    return () => {
      menuSub.unsubscribe();
      adviceSub.unsubscribe();
    };
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8 md:space-y-12">
        <div className="text-center py-4 md:py-8">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
             className="inline-block px-2"
           >
             <h1 className="text-3xl md:text-6xl font-serif text-stone-800 mb-2 md:mb-4 font-bold leading-tight">
               Welkom bij <span className="text-orange-600 block md:inline">Prins Heerlijke Adviezen</span>
             </h1>
             <p className="text-base md:text-lg text-stone-600 italic">Uw dagelijkse bron van culinaire inspiratie en wijs advies</p>
           </motion.div>
        </div>

        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card title={`Prins Heerlijk Menu van ${menu ? menu.formattedDate : today}`} icon={Utensils} className="relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-100 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
             
             {loading ? (
               <LoadingSpinner />
             ) : menu && menu.formattedDate === today ? (
               <div className="prose prose-stone max-w-none text-base md:text-lg">
                 <div className="whitespace-pre-wrap leading-relaxed text-stone-700 font-medium">
                   {menu.items}
                 </div>
                 <div className="mt-6 flex items-center gap-2 text-xs md:text-sm text-stone-400">
                    <Clock size={14} />
                    <span>Geüpdatet om {new Date(menu.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400 text-center">
                  <Utensils size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif italic mb-1">Het menu voor vandaag is nog niet ingevoerd.</p>
                  <p className="text-sm">Kom later terug voor smakelijke updates!</p>
                </div>
             )}
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
        >
          <Card title="Cyriel's Advies" icon={Sparkles} className="bg-gradient-to-br from-white to-amber-50/30">
             {loading ? (
               <LoadingSpinner />
             ) : advice ? (
               <div className="relative">
                 <div className="text-6xl absolute -top-4 -left-2 text-orange-200 font-serif opacity-50">"</div>
                 <p className="whitespace-pre-wrap text-lg md:text-xl text-stone-700 italic pl-6 md:pl-8 pr-2 relative z-10 font-serif leading-loose">
                   {advice.advice}
                 </p>
                 <div className="mt-8 flex justify-end items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-stone-800 text-sm">- Cyriel</p>
                      <p className="text-xs text-stone-400">{new Date(advice.timestamp).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold font-serif shrink-0">C</div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-stone-400 text-center">
                  <Coffee size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif italic">Cyriel is nog aan het broeden op zijn advies.</p>
               </div>
             )}
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

const InputPage = ({ type }: { type: 'menu' | 'advice' }) => {
  const isMenu = type === 'menu';
  
  const [isLocked, setIsLocked] = useState(type === 'advice');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  const [menuData, setMenuData] = useState({
    dish1: '', price1: '',
    dish2: '', price2: '',
    soup: '', priceSoup: ''
  });

  const [adviceContent, setAdviceContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (type === 'advice') {
      setIsLocked(true);
      setPasswordInput('');
      setAuthError(false);
    } else {
      setIsLocked(false);
    }
  }, [type]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'millofdastevehood') {
      setIsLocked(false);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMenuData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (isMenu) {
        const formattedMenu = `🍽️ Gerecht 1
${menuData.dish1}
Prijs: € ${menuData.price1}

🍽️ Gerecht 2
${menuData.dish2}
Prijs: € ${menuData.price2}

🥣 Soep
${menuData.soup}
Prijs: € ${menuData.priceSoup}`;
        
        await storage.saveMenu(formattedMenu);
      } else {
        await storage.saveAdvice(adviceContent);
      }

      setIsSaved(true);
      // Reset form partially? Maybe keep data visible.
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      alert("Er is iets fout gegaan bij het opslaan. Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLocked && !isMenu) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto mt-10 md:mt-20">
          <Card title="Beveiligde Toegang" icon={Lock}>
            <div className="text-center mb-6 text-stone-600">
              <p>Deze pagina is alleen toegankelijk voor Cyriel.</p>
            </div>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Voer wachtwoord in..."
                  className={`w-full p-3 rounded-lg border ${authError ? 'border-red-300 bg-red-50 text-red-900' : 'border-stone-200 focus:border-orange-500'} outline-none transition-all`}
                  autoFocus
                />
                {authError && (
                  <p className="text-red-500 text-sm mt-2 animate-pulse">Wachtwoord onjuist. Probeer het opnieuw.</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-stone-800 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex justify-center items-center gap-2 active:scale-95"
              >
                <Unlock size={18} />
                Ontgrendelen
              </button>
            </form>
          </Card>
        </div>
      </PageTransition>
    );
  }

  const title = isMenu ? "Voer Prins Heerlijk Menu In" : "Voer Cyriel's Advies In";
  const Icon = isMenu ? Utensils : Coffee;
  const isMenuValid = menuData.dish1 && menuData.price1 && menuData.dish2 && menuData.price2 && menuData.soup && menuData.priceSoup;
  const isAdviceValid = adviceContent.trim().length > 0;
  const isValid = isMenu ? isMenuValid : isAdviceValid;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <Card title={title} icon={Icon}>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {isMenu ? (
              <div className="space-y-4 md:space-y-6">
                 {/* Dish 1 */}
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-3 text-orange-700 font-serif font-bold">
                      <Utensils size={18} />
                      <h3>Gerecht 1</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Omschrijving</label>
                        <input
                          type="text"
                          name="dish1"
                          value={menuData.dish1}
                          onChange={handleMenuChange}
                          placeholder="Bijv. Ambachtelijke kroket"
                          className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Prijs</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Euro size={16} className="text-stone-400" />
                          </div>
                          <input
                            type="text"
                            name="price1"
                            value={menuData.price1}
                            onChange={handleMenuChange}
                            placeholder="0,00"
                            className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm md:text-base"
                          />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Dish 2 */}
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-3 text-orange-700 font-serif font-bold">
                      <Utensils size={18} />
                      <h3>Gerecht 2</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                         <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Omschrijving</label>
                        <input
                          type="text"
                          name="dish2"
                          value={menuData.dish2}
                          onChange={handleMenuChange}
                          placeholder="Bijv. Broodje Gezond"
                          className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Prijs</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Euro size={16} className="text-stone-400" />
                          </div>
                          <input
                            type="text"
                            name="price2"
                            value={menuData.price2}
                            onChange={handleMenuChange}
                            placeholder="0,00"
                            className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm md:text-base"
                          />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Soup */}
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-3 text-orange-700 font-serif font-bold">
                      <Soup size={18} />
                      <h3>Soep</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Omschrijving</label>
                        <input
                          type="text"
                          name="soup"
                          value={menuData.soup}
                          onChange={handleMenuChange}
                          placeholder="Bijv. Verse Pompoensoep"
                          className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm md:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Prijs</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Euro size={16} className="text-stone-400" />
                          </div>
                          <input
                            type="text"
                            name="priceSoup"
                            value={menuData.priceSoup}
                            onChange={handleMenuChange}
                            placeholder="0,00"
                            className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm md:text-base"
                          />
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={adviceContent}
                  onChange={(e) => setAdviceContent(e.target.value)}
                  required
                  rows={8}
                  placeholder="Wat is het wijs advies van de dag?"
                  className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none font-medium text-stone-700 placeholder:text-stone-400"
                />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                type="submit"
                disabled={!isValid || isSaving}
                className="group relative w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-stone-800 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : isSaved ? "Opgeslagen!" : "Publiceren"} 
                   {!isSaving && !isSaved && <Save size={18} className="group-hover:scale-110 transition-transform" />}
                </span>
                
                <div className={`absolute inset-0 bg-green-500 transition-transform duration-500 origin-left ${isSaved ? 'scale-x-100' : 'scale-x-0'}`} />
              </button>
            </div>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
};

const HistoryPage = ({ type }: { type: 'menu' | 'advice' }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const title = type === 'menu' ? "Historie: Menu's" : "Historie: Adviezen";
  
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (type === 'menu') {
          const raw = await storage.getMenus();
          setItems(storage.getUniqueHistory(raw));
        } else {
          const raw = await storage.getAdvices();
          setItems(storage.getUniqueHistory(raw));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [type]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="p-3 bg-white rounded-full shadow-md text-orange-600">
            <History size={24} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight">{title}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
            <p className="text-stone-400 font-serif text-lg">Nog geen historie beschikbaar.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-orange-200 transition-all cursor-default">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-orange-500 shrink-0" />
                        <h3 className="text-lg md:text-xl font-bold font-serif text-stone-800 capitalize">
                          {item.formattedDate}
                        </h3>
                      </div>
                      <div className="pl-4 md:pl-6 border-l-2 border-orange-100 group-hover:border-orange-300 transition-colors">
                        <div className="text-stone-600 whitespace-pre-wrap text-sm md:text-base">
                          {type === 'menu' ? item.items : item.advice}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-stone-400 bg-stone-50 px-2 py-1 rounded self-start md:self-start">
                      {new Date(item.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/input/menu" element={<InputPage type="menu" />} />
          <Route path="/input/advice" element={<InputPage type="advice" />} />
          <Route path="/history/menu" element={<HistoryPage type="menu" />} />
          <Route path="/history/advice" element={<HistoryPage type="advice" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}