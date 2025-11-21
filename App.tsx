import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MenuEntry, AdviceEntry, BurritoEntry } from './types';
import * as storage from './services/storage';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Utensils, Coffee, Save, Calendar, Clock, Sparkles, History, Euro, Soup, Lock, Unlock, Loader2, CheckCircle2, Sandwich, PenTool } from 'lucide-react';

// --- Shared Components ---

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Slower, smoother page transition
  >
    {children}
  </motion.div>
);

// New Component: Triggers animation when element enters viewport
const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, scale: 0.96 }} // Start slightly lower and smaller
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }} // Triggers slightly before bottom
    transition={{ duration: 1.5, delay, ease: [0.16, 1, 0.3, 1] }} // Ultra slow and smooth easing
    className={className}
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
  const [burrito, setBurrito] = useState<BurritoEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const loadData = async () => {
    const [latestMenu, latestAdvice, latestBurrito] = await Promise.all([
      storage.getLatestMenu(),
      storage.getLatestAdvice(),
      storage.getLatestBurritoStatus()
    ]);
    setMenu(latestMenu);
    setAdvice(latestAdvice);
    setBurrito(latestBurrito);
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
    const burritoSub = storage.subscribeToBurritoUpdates(() => {
      loadData();
    });

    return () => {
      menuSub.unsubscribe();
      adviceSub.unsubscribe();
      burritoSub.unsubscribe();
    };
  }, []);

  return (
    <PageTransition>
      <div className="space-y-8 md:space-y-12 pb-12">
        <div className="text-center py-8 md:py-12">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0, y: 30 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} // Very slow entry for title
             className="inline-block px-2"
           >
             <h1 className="text-4xl md:text-7xl font-serif text-stone-800 mb-4 font-bold leading-tight tracking-tight">
               Welkom bij <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 block md:inline">Prins Heerlijke Adviezen</span>
             </h1>
             <p className="text-base md:text-xl text-stone-600 italic max-w-2xl mx-auto">Uw dagelijkse bron van culinaire inspiratie en wijs advies</p>
           </motion.div>
        </div>

        <ScrollReveal delay={0.2}>
          <Card title={`Prins Heerlijk Menu van ${menu ? menu.formattedDate : today}`} icon={Utensils} className="relative overflow-hidden transition-shadow hover:shadow-2xl duration-700">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-100 rounded-full opacity-20 blur-3xl pointer-events-none animate-pulse"></div>
             
             {loading ? (
               <LoadingSpinner />
             ) : menu && menu.formattedDate === today ? (
               <div className="prose prose-stone max-w-none text-base md:text-lg relative z-10">
                 <div className="whitespace-pre-wrap leading-relaxed text-stone-700 font-medium">
                   {menu.items}
                 </div>
                 <div className="mt-6 flex items-center gap-2 text-xs md:text-sm text-stone-400 border-t border-orange-50 pt-4">
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
        </ScrollReveal>
        
        {/* Burrito Status Card */}
        <ScrollReveal delay={0.3}>
          <Card title="Heeft Job vandaag burritos bij?" icon={Sandwich} className="transition-shadow hover:shadow-2xl duration-700 border-orange-100">
             {loading ? (
               <LoadingSpinner />
             ) : burrito && burrito.formattedDate === today ? (
               <div className="flex flex-col items-center justify-center py-6">
                 <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ type: "spring", stiffness: 200, damping: 15 }}
                   className={`text-6xl md:text-8xl font-bold font-serif ${burrito.hasBurritos ? 'text-green-600' : 'text-red-500'}`}
                 >
                   {burrito.hasBurritos ? 'JA' : 'NEE'}
                 </motion.div>
                 <p className="text-stone-500 mt-4 italic">
                    {burrito.hasBurritos ? "Het is feest vandaag! 🎉" : "Helaas, misschien morgen weer. 🥪"}
                 </p>
                 <div className="mt-6 text-xs text-stone-400">
                    Geüpdatet om {new Date(burrito.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-8 text-stone-400 text-center">
                  <Sandwich size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif italic">Job heeft nog niks laten weten.</p>
               </div>
             )}
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <Card title="Cyriel's Advies" icon={Sparkles} className="bg-gradient-to-br from-white to-amber-50/30 transition-shadow hover:shadow-2xl duration-700">
             {loading ? (
               <LoadingSpinner />
             ) : advice ? (
               <div className="relative">
                 <div className="text-8xl absolute -top-6 -left-4 text-orange-200 font-serif opacity-40 select-none">"</div>
                 <p className="whitespace-pre-wrap text-lg md:text-2xl text-stone-700 italic pl-8 md:pl-10 pr-4 relative z-10 font-serif leading-loose">
                   {advice.advice}
                 </p>
                 <div className="mt-8 flex justify-end items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-stone-800 text-base">- Cyriel</p>
                      <p className="text-xs text-stone-400">{new Date(advice.timestamp).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold font-serif text-xl shrink-0 shadow-inner">C</div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-stone-400 text-center">
                  <Coffee size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif italic">Cyriel is nog aan het broeden op zijn advies.</p>
               </div>
             )}
          </Card>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};

const InputPage = ({ type }: { type: 'menu' | 'advice' | 'burritos' }) => {
  const isMenu = type === 'menu';
  const isAdvice = type === 'advice';
  const isBurritos = type === 'burritos';
  
  const [isLocked, setIsLocked] = useState(isAdvice || isBurritos);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isNewDay, setIsNewDay] = useState(false);

  const [menuData, setMenuData] = useState({
    dish1: '', price1: '',
    dish2: '', price2: '',
    soup: '', priceSoup: ''
  });

  const [adviceContent, setAdviceContent] = useState('');
  const [burritoStatus, setBurritoStatus] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isAdvice || isBurritos) {
      setIsLocked(true);
      setPasswordInput('');
      setAuthError(false);
    } else {
      setIsLocked(false);
    }
    // Reset data when switching types
    setMenuData({ dish1: '', price1: '', dish2: '', price2: '', soup: '', priceSoup: '' });
    setAdviceContent('');
    setBurritoStatus(null);
    setDataLoaded(false);
    setIsNewDay(false);
  }, [type]);

  // Load existing data for today
  useEffect(() => {
    const loadCurrentData = async () => {
      if (isLocked) return; // Don't load if locked

      setIsLoadingData(true);
      
      try {
        const todayNL = new Date().toLocaleString("en-US", {timeZone: "Europe/Amsterdam"});
        const todayDate = new Date(todayNL);
        const yyyy = todayDate.getFullYear();
        const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(todayDate.getDate()).padStart(2, '0');
        const currentValDateStr = `${yyyy}-${mm}-${dd}`;

        if (isMenu) {
          const latestMenu = await storage.getLatestMenu();
          
          if (latestMenu && latestMenu.dateStr === currentValDateStr) {
            const lines = latestMenu.items.split('\n');
            
            const findVal = (marker: string) => {
               const idx = lines.findIndex(l => l.includes(marker));
               return (idx !== -1 && lines[idx + 1]) ? lines[idx + 1].trim() : '';
            };
            const findPrice = (marker: string) => {
               const idx = lines.findIndex(l => l.includes(marker));
               if (idx === -1) return '';
               // Search next 3 lines for price
               for(let i = idx + 1; i < idx + 4 && i < lines.length; i++) {
                 if (lines[i].includes('Prijs: €')) return lines[i].replace('Prijs: €', '').trim();
               }
               return '';
            };

            setMenuData({
              dish1: findVal('🍽️ Gerecht 1'),
              price1: findPrice('🍽️ Gerecht 1'),
              dish2: findVal('🍽️ Gerecht 2'),
              price2: findPrice('🍽️ Gerecht 2'),
              soup: findVal('🥣 Soep'),
              priceSoup: findPrice('🥣 Soep')
            });
            setDataLoaded(true);
            setIsNewDay(false);
          } else {
            setIsNewDay(true);
          }
        } else if (isAdvice) {
           const latestAdvice = await storage.getLatestAdvice();
           
           if (latestAdvice && latestAdvice.dateStr === currentValDateStr) {
             setAdviceContent(latestAdvice.advice);
             setDataLoaded(true);
             setIsNewDay(false);
           } else {
             setIsNewDay(true);
           }
        } else if (isBurritos) {
           const latestBurrito = await storage.getLatestBurritoStatus();
           if (latestBurrito && latestBurrito.dateStr === currentValDateStr) {
             setBurritoStatus(latestBurrito.hasBurritos);
             setDataLoaded(true);
             setIsNewDay(false);
           } else {
             setIsNewDay(true);
             setBurritoStatus(null);
           }
        }
      } catch (e) {
        console.error("Error loading existing data", e);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCurrentData();
  }, [isMenu, isAdvice, isBurritos, isLocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    let correctPassword = '';
    
    if (isAdvice) correctPassword = 'millofdastevehood';
    if (isBurritos) correctPassword = 'Alexander1';

    if (passwordInput === correctPassword) {
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
      } else if (isAdvice) {
        await storage.saveAdvice(adviceContent);
      } else if (isBurritos) {
        if (burritoStatus === null) return;
        await storage.saveBurritoStatus(burritoStatus);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setDataLoaded(true); // Now we have data for today
      setIsNewDay(false);
    } catch (err) {
      alert("Er is iets fout gegaan bij het opslaan. Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLocked) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto mt-10 md:mt-20">
          <ScrollReveal>
            <Card title="Beveiligde Toegang" icon={Lock}>
              <div className="text-center mb-6 text-stone-600">
                <p>Deze pagina is alleen toegankelijk voor {isAdvice ? "Cyriel" : "Job"}.</p>
              </div>
              <form onSubmit={handleUnlock} className="space-y-4">
                <motion.div 
                   animate={authError ? { x: [-10, 10, -10, 10, 0] } : {}}
                   transition={{ duration: 0.4 }}
                >
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
                    <p className="text-red-500 text-sm mt-2">Wachtwoord onjuist. Probeer het opnieuw.</p>
                  )}
                </motion.div>
                <button
                  type="submit"
                  className="w-full py-3 bg-stone-800 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex justify-center items-center gap-2 active:scale-95"
                >
                  <Unlock size={18} />
                  Ontgrendelen
                </button>
              </form>
            </Card>
          </ScrollReveal>
        </div>
      </PageTransition>
    );
  }

  let title = "Invoer";
  let Icon = PenTool;
  
  if (isMenu) {
    title = "Voer Prins Heerlijk Menu In";
    Icon = Utensils;
  } else if (isAdvice) {
    title = "Voer Cyriel's Advies In";
    Icon = Coffee;
  } else if (isBurritos) {
    title = "Heeft Job Burritos bij?";
    Icon = Sandwich;
  }
  
  let isValid = false;
  if (isMenu) {
    isValid = (menuData.dish1 + menuData.price1 + menuData.dish2 + menuData.price2 + menuData.soup + menuData.priceSoup).length > 0;
  } else if (isAdvice) {
    isValid = adviceContent.trim().length > 0;
  } else if (isBurritos) {
    isValid = burritoStatus !== null;
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto pb-12">
        <ScrollReveal>
          <Card title={title} icon={Icon}>
            {isLoadingData ? (
               <div className="py-12 flex justify-center">
                 <Loader2 className="animate-spin text-orange-400" size={32} />
               </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              
              <AnimatePresence>
                {isNewDay && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-3 border border-blue-100 shadow-sm"
                  >
                    <Sparkles size={18} className="shrink-0" />
                    <div>
                      <span className="font-bold">Nieuwe dag, nieuwe kansen!</span>
                      <p className="text-xs opacity-80">Het formulier is leeggemaakt voor vandaag.</p>
                    </div>
                  </motion.div>
                )}
                
                {dataLoaded && !isNewDay && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-green-100"
                  >
                    <CheckCircle2 size={16} />
                    <span>Gegevens van vandaag ingeladen. Je bewerkt nu de bestaande invoer.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {isMenu && (
                <div className="space-y-4 md:space-y-6">
                   {/* Dish 1 */}
                   <ScrollReveal delay={0.2}>
                     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-orange-200 transition-colors duration-300">
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
                   </ScrollReveal>

                   {/* Dish 2 */}
                   <ScrollReveal delay={0.4}>
                     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-orange-200 transition-colors duration-300">
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
                   </ScrollReveal>

                   {/* Soup */}
                   <ScrollReveal delay={0.6}>
                     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-orange-200 transition-colors duration-300">
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
                   </ScrollReveal>
                </div>
              )}

              {isAdvice && (
                <ScrollReveal delay={0.2}>
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
                </ScrollReveal>
              )}

              {isBurritos && (
                <ScrollReveal delay={0.2}>
                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center py-8">
                    <button
                      type="button"
                      onClick={() => setBurritoStatus(true)}
                      className={`w-40 h-40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 ${burritoStatus === true ? 'bg-green-500 text-white border-green-600 shadow-xl scale-105' : 'bg-white text-stone-400 border-stone-200 hover:border-green-300 hover:text-green-500'}`}
                    >
                       <span className="text-3xl font-bold">JA</span>
                       <span className="text-sm opacity-80">Feest!</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setBurritoStatus(false)}
                      className={`w-40 h-40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 ${burritoStatus === false ? 'bg-red-500 text-white border-red-600 shadow-xl scale-105' : 'bg-white text-stone-400 border-stone-200 hover:border-red-300 hover:text-red-500'}`}
                    >
                       <span className="text-3xl font-bold">NEE</span>
                       <span className="text-sm opacity-80">Helaas...</span>
                    </button>
                  </div>
                  <div className="text-center text-stone-400 text-sm italic">
                     Selecteer de status voor vandaag
                  </div>
                </ScrollReveal>
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
            )}
          </Card>
        </ScrollReveal>
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
      <div className="space-y-8 pb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 mb-6 md:mb-8"
        >
          <div className="p-3 bg-white rounded-full shadow-md text-orange-600">
            <History size={24} className="md:w-8 md:h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight">{title}</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : items.length === 0 ? (
          <ScrollReveal>
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-serif text-lg">Nog geen historie beschikbaar.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid gap-6">
            {items.map((item, index) => (
              <ScrollReveal key={item.id} delay={index < 5 ? index * 0.15 : 0}>
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
              </ScrollReveal>
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
          <Route path="/input/burritos" element={<InputPage type="burritos" />} />
          <Route path="/history/menu" element={<HistoryPage type="menu" />} />
          <Route path="/history/advice" element={<HistoryPage type="advice" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}