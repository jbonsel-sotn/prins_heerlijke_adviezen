import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MenuEntry, AdviceEntry } from './types';
import * as storage from './services/storage';
import { motion } from 'framer-motion';
import { Utensils, Coffee, Save, Calendar, Clock, Sparkles, History, Euro, Soup } from 'lucide-react';

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
    <div className="bg-orange-50/50 p-6 border-b border-orange-100 flex items-center gap-3">
      {Icon && <Icon className="text-orange-500" size={24} />}
      <h2 className="text-2xl font-serif font-bold text-stone-800">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// --- Pages ---

const HomePage = () => {
  const [menu, setMenu] = useState<MenuEntry | null>(null);
  const [advice, setAdvice] = useState<AdviceEntry | null>(null);
  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const loadData = () => {
    setMenu(storage.getLatestMenu());
    setAdvice(storage.getLatestAdvice());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-12">
        <div className="text-center py-8">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8 }}
             className="inline-block"
           >
             <h1 className="text-4xl md:text-6xl font-serif text-stone-800 mb-4 font-bold">Welkom bij <span className="text-orange-600">Prins Heerlijke Adviezen</span></h1>
             <p className="text-lg text-stone-600 italic">Uw dagelijkse bron van culinaire inspiratie en wijs advies</p>
           </motion.div>
        </div>

        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card title={`Prins Heerlijk Menu van ${menu ? menu.formattedDate : today}`} icon={Utensils} className="relative overflow-hidden">
             {/* Decorative background element */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-100 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
             
             {menu && menu.formattedDate === today ? (
               <div className="prose prose-stone max-w-none text-lg">
                 <div className="whitespace-pre-wrap leading-relaxed text-stone-700 font-medium">
                   {menu.items}
                 </div>
                 <div className="mt-6 flex items-center gap-2 text-sm text-stone-400">
                    <Clock size={14} />
                    <span>Geüpdatet om {new Date(menu.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                  <Utensils size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif italic">Het menu voor vandaag is nog niet ingevoerd.</p>
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
             {advice ? (
               <div className="relative">
                 <div className="text-6xl absolute -top-4 -left-2 text-orange-200 font-serif opacity-50">"</div>
                 <p className="whitespace-pre-wrap text-xl text-stone-700 italic pl-8 pr-4 relative z-10 font-serif leading-loose">
                   {advice.advice}
                 </p>
                 <div className="mt-8 flex justify-end items-center gap-2">
                    <div className="text-right">
                      <p className="font-bold text-stone-800 text-sm">- Cyriel</p>
                      <p className="text-xs text-stone-400">{new Date(advice.timestamp).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold font-serif">C</div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-stone-400">
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
  
  // State for Menu Inputs
  const [menuData, setMenuData] = useState({
    dish1: '', price1: '',
    dish2: '', price2: '',
    soup: '', priceSoup: ''
  });

  // State for Advice Input
  const [adviceContent, setAdviceContent] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);

  const handleMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMenuData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isMenu) {
      // Construct the formatted menu string
      const formattedMenu = `🍽️ Gerecht 1
${menuData.dish1}
Prijs: € ${menuData.price1}

🍽️ Gerecht 2
${menuData.dish2}
Prijs: € ${menuData.price2}

🥣 Soep
${menuData.soup}
Prijs: € ${menuData.priceSoup}`;
      
      storage.saveMenu(formattedMenu);
    } else {
      storage.saveAdvice(adviceContent);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    
    // Optional: Clear form or keep it. Keeping it allows for quick edits if mistake made.
    // If we wanted to clear:
    // if (isMenu) setMenuData({ dish1: '', price1: '', dish2: '', price2: '', soup: '', priceSoup: '' });
    // else setAdviceContent('');
  };

  const title = isMenu ? "Voer Prins Heerlijk Menu In" : "Voer Cyriel's Advies In";
  const Icon = isMenu ? Utensils : Coffee;

  const isMenuValid = menuData.dish1 && menuData.price1 && menuData.dish2 && menuData.price2 && menuData.soup && menuData.priceSoup;
  const isAdviceValid = adviceContent.trim().length > 0;
  const isValid = isMenu ? isMenuValid : isAdviceValid;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto">
        <Card title={title} icon={Icon}>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {isMenu ? (
              <div className="space-y-6">
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
                          placeholder="Bijv. Ambachtelijke kroket met brood"
                          className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                            className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                          placeholder="Bijv. Broodje Gezond Deluxe"
                          className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                            className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                          className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                            className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
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
                disabled={!isValid}
                className="group relative flex items-center gap-2 px-8 py-3 bg-stone-800 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                   {isSaved ? "Opgeslagen!" : "Publiceren"} 
                   {!isSaved && <Save size={18} className="group-hover:scale-110 transition-transform" />}
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
  const title = type === 'menu' ? "Historie: Menu's" : "Historie: Adviezen";
  
  useEffect(() => {
    if (type === 'menu') {
      setItems(storage.getUniqueHistory(storage.getMenus()));
    } else {
      setItems(storage.getUniqueHistory(storage.getAdvices()));
    }
  }, [type]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white rounded-full shadow-md text-orange-600">
            <History size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">{title}</h1>
        </div>

        {items.length === 0 ? (
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:border-orange-200 transition-all cursor-default">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={16} className="text-orange-500" />
                        <h3 className="text-xl font-bold font-serif text-stone-800 capitalize">
                          {item.formattedDate}
                        </h3>
                      </div>
                      <div className="pl-6 border-l-2 border-orange-100 group-hover:border-orange-300 transition-colors">
                        <div className="text-stone-600 whitespace-pre-wrap">
                          {type === 'menu' ? item.items : item.advice}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-stone-400 bg-stone-50 px-2 py-1 rounded self-start">
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