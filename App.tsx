import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MenuEntry, AdviceEntry, BurritoEntry, DishPhotoEntry } from './types';
import * as storage from './services/storage';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import { Utensils, Coffee, Save, Calendar, Clock, Sparkles, History, Euro, Soup, Lock, Unlock, Loader2, CheckCircle2, Sandwich, PenTool, Camera, Image as ImageIcon, UploadCloud, X } from 'lucide-react';

// --- Shared Components ---

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-stone-50">
      {/* Mesh Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-stone-50 to-stone-100/20"></div>
      
      <motion.div 
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          x: [0, -50, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px]" 
      />
      <motion.div 
        animate={{ 
          x: [0, 30, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-rose-200/10 rounded-full blur-[80px]" 
      />
    </div>
  );
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated Icon Wrapper for specific types
const AnimatedIcon = ({ icon: Icon, type }: { icon: any, type?: 'menu' | 'advice' | 'burrito' | 'default' }) => {
  const variants: Record<string, Variants> = {
    menu: {
      hover: { rotate: [0, -15, 15, -10, 5, 0], transition: { duration: 0.6 } }
    },
    advice: {
      hover: { y: [0, -5, 0], opacity: [1, 0.7, 1], transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" } }
    },
    burrito: {
      hover: { scale: [1, 1.2, 0.9, 1.1, 1], transition: { duration: 0.6 } }
    },
    default: {
      hover: { rotate: 360, transition: { duration: 0.8, ease: "easeInOut" } }
    }
  };

  const selectedVariant = type === 'menu' ? variants.menu 
                        : type === 'advice' ? variants.advice 
                        : type === 'burrito' ? variants.burrito 
                        : variants.default;

  return (
    <motion.div variants={selectedVariant}>
      <Icon className="text-orange-500 shrink-0" size={28} />
    </motion.div>
  );
};

const Card = ({ title, children, icon: Icon, type = 'default', className = "" }: { title: string; children: React.ReactNode; icon?: any; type?: 'menu' | 'advice' | 'burrito' | 'default'; className?: string }) => (
  <motion.div 
    whileHover={{ y: -8, boxShadow: "0 20px 40px -10px rgba(249, 115, 22, 0.15)" }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 ring-1 ring-orange-100/50 overflow-hidden ${className}`}
  >
    <div className="bg-gradient-to-r from-orange-50/80 to-stone-50/50 p-5 md:p-6 border-b border-orange-100/50 flex flex-col md:flex-row md:items-center gap-3 relative overflow-hidden">
       {/* Shimmer effect on header */}
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]" />

      <motion.div 
        className="flex items-center gap-3 relative z-10"
        initial="rest" whileHover="hover" animate="rest"
      >
        {Icon && (
          <div className="p-2 bg-white rounded-xl shadow-sm border border-orange-100">
             <AnimatedIcon icon={Icon} type={type} />
          </div>
        )}
        <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 leading-tight tracking-tight">{title}</h2>
      </motion.div>
    </div>
    <div className="p-5 md:p-6">
      {children}
    </div>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <Loader2 className="animate-spin text-orange-500" size={32} />
  </div>
);

// --- Custom Animations ---

const BurritoOven = ({ hasBurritos }: { hasBurritos: boolean }) => {
  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-center perspective-[1000px]">
      {/* Smoke Particles (Only if JA) */}
      <AnimatePresence>
        {hasBurritos && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 0.4, 0], 
                  y: -60 - (i * 10), 
                  x: (i % 2 === 0 ? 10 : -10),
                  scale: 1.5 
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  delay: i * 0.8,
                  ease: "easeInOut"
                }}
                className="absolute top-10 w-6 h-6 bg-white rounded-full blur-md z-0"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Oven Body */}
      <div className="relative z-10 w-48 h-36 bg-stone-800 rounded-2xl border-4 border-stone-700 shadow-2xl flex items-center justify-center overflow-hidden ring-1 ring-stone-900/50">
         <div className="absolute inset-0 bg-stone-950 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>
         <div className="absolute top-2 left-4 right-4 h-1 bg-orange-900/30 rounded-full animate-pulse"></div>
         <div className="absolute bottom-2 left-4 right-4 h-1 bg-orange-900/30 rounded-full animate-pulse"></div>

         <AnimatePresence mode="wait">
           {hasBurritos ? (
             <motion.div
               key="burrito"
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
               className="relative z-10 transform translate-y-2"
             >
                <div className="w-32 h-12 bg-amber-200 rounded-full shadow-lg relative overflow-hidden border border-amber-300/50 flex items-center">
                   <div className="absolute left-0 top-0 bottom-0 w-16 bg-stone-300 skew-x-12 -ml-4 border-r border-stone-400/30 shadow-sm"></div>
                   <div className="absolute right-4 top-3 w-1 h-1 bg-amber-600/20 rounded-full"></div>
                   <div className="absolute right-8 bottom-3 w-1 h-1 bg-amber-600/20 rounded-full"></div>
                </div>
             </motion.div>
           ) : (
             <motion.div
               key="empty"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="text-stone-700 text-xs font-mono relative z-10"
             >
               *leeg*
             </motion.div>
           )}
         </AnimatePresence>
      </div>

      <motion.div
         initial={{ rotateX: 0 }}
         animate={{ rotateX: 105 }}
         transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
         style={{ transformOrigin: "bottom", transformStyle: "preserve-3d" }}
         className="absolute bottom-[calc(50%-4.5rem)] z-20 w-48 h-36 bg-stone-200 rounded-2xl border-4 border-stone-300 flex items-center justify-center shadow-lg origin-bottom"
      >
         <div className="w-36 h-24 bg-stone-800/10 rounded-lg border border-stone-300/50 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-full h-full bg-sky-900/20 rounded border border-white/20"></div>
         </div>
         <div className="absolute top-4 w-32 h-3 bg-stone-300 rounded-full shadow-sm border border-stone-100"></div>
      </motion.div>

      <div className="absolute -bottom-2 left-4 w-4 h-3 bg-stone-900 rounded-b-lg"></div>
      <div className="absolute -bottom-2 right-4 w-4 h-3 bg-stone-900 rounded-b-lg"></div>
    </div>
  );
};

// --- Modals ---

const PhotoUploadModal = ({ 
  isOpen, 
  onClose, 
  dishName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  dishName: string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploaderName, setUploaderName] = useState('');
  const [comment, setComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setUploaderName('');
      setComment('');
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !uploaderName) return;

    setIsUploading(true);
    try {
      const publicUrl = await storage.uploadPhoto(file);
      await storage.saveDishPhoto(dishName, publicUrl, uploaderName, comment);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Uploaden mislukt. Probeer het opnieuw.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-center">
              <h3 className="font-serif font-bold text-xl text-stone-800">Foto toevoegen bij {dishName}</h3>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {!previewUrl ? (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 hover:border-orange-400 transition-colors gap-2 text-orange-700 group"
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Camera size={24} />
                    </div>
                    <span className="font-semibold text-sm">Camera openen</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400 transition-colors gap-2 text-stone-600 group"
                  >
                    <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <ImageIcon size={24} />
                    </div>
                    <span className="font-semibold text-sm">Kies uit galerij</span>
                  </button>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-sm group">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Hidden Inputs */}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={cameraInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
              />

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Jouw Naam (Verplicht)</label>
                  <input 
                    type="text" 
                    required 
                    value={uploaderName} 
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="Wie heeft deze foto gemaakt?" 
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Opmerking (Optioneel)</label>
                  <textarea 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Wat vond je ervan?" 
                    className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!file || !uploaderName || isUploading}
                className="w-full py-3 bg-stone-800 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={20} />}
                {isUploading ? "Uploaden..." : "Foto Opslaan"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ImageModal = ({ photo, onClose }: { photo: DishPhotoEntry | null, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {photo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-5xl bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Area */}
            <div className="flex-1 bg-stone-950 flex items-center justify-center relative min-h-[300px] overflow-hidden group">
               <img 
                 src={photo.photoUrl} 
                 alt={photo.dishSection} 
                 className="w-full h-full object-contain"
               />
               <button 
                 onClick={onClose} 
                 className="absolute top-4 left-4 p-2 bg-black/50 text-white/80 rounded-full hover:bg-black/80 hover:text-white transition-all md:hidden"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Sidebar / Info Area */}
            <div className="w-full md:w-80 bg-white border-l border-stone-200 p-6 md:p-8 flex flex-col overflow-y-auto shrink-0">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <span className="inline-block px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
                       {photo.dishSection}
                     </span>
                     <h3 className="text-xl font-serif font-bold text-stone-800">Gerecht Foto</h3>
                  </div>
                  <button 
                    onClick={onClose} 
                    className="hidden md:block p-2 text-stone-400 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
               </div>

               <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Fotograaf</h4>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                          {photo.uploaderName.charAt(0).toUpperCase()}
                       </div>
                       <p className="font-semibold text-stone-800">{photo.uploaderName}</p>
                    </div>
                  </div>

                  {photo.comment && (
                    <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Opmerking</h4>
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 italic text-stone-600 leading-relaxed text-sm">
                        "{photo.comment}"
                      </div>
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-400 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                     <Calendar size={14} />
                     <span>{new Date(photo.timestamp).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock size={14} />
                     <span>{new Date(photo.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Pages ---

const HomePage = () => {
  const [menu, setMenu] = useState<MenuEntry | null>(null);
  const [advice, setAdvice] = useState<AdviceEntry | null>(null);
  const [burrito, setBurrito] = useState<BurritoEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Photo Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedDishForPhoto, setSelectedDishForPhoto] = useState('');

  // Selected photo for ImageModal (can be from Advice)
  const [viewingPhoto, setViewingPhoto] = useState<DishPhotoEntry | null>(null);

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
    const menuSub = storage.subscribeToMenuUpdates(loadData);
    const adviceSub = storage.subscribeToAdviceUpdates(loadData);
    const burritoSub = storage.subscribeToBurritoUpdates(loadData);
    return () => { menuSub.unsubscribe(); adviceSub.unsubscribe(); burritoSub.unsubscribe(); };
  }, []);

  const openPhotoModal = (dish: string) => {
    setSelectedDishForPhoto(dish);
    setIsPhotoModalOpen(true);
  };

  const handleAdvicePhotoClick = () => {
    if (!advice?.photoUrl) return;
    // Construct a temporary photo entry for the modal
    setViewingPhoto({
      id: advice.id,
      dateStr: advice.dateStr,
      dishSection: "Cyriel's Advies",
      photoUrl: advice.photoUrl,
      uploaderName: "Cyriel",
      comment: advice.advice,
      timestamp: advice.timestamp
    });
  };

  const menuDisplayDate = (menu && menu.formattedDate === today) ? menu.formattedDate : today;

  // Helper to parse and render menu sections with camera icon
  const renderMenuContent = (menuText: string) => {
    // We try to split by known headers used in InputPage. 
    // If exact headers aren't found (legacy data), we fallback to full text.
    const sections = [
      { id: 'dish1', header: '🍽️ Gerecht 1', label: 'Gerecht 1' },
      { id: 'dish2', header: '🍽️ Gerecht 2', label: 'Gerecht 2' },
      { id: 'soup', header: '🥣 Soep', label: 'Soep' }
    ];

    let content = menuText;
    const parsedBlocks: React.ReactNode[] = [];
    
    // Check if the text structure matches our template
    const hasStructure = sections.every(s => content.includes(s.header));

    if (hasStructure) {
      // Split and render blocks
      const splitByHeader = (text: string, header: string) => {
         const parts = text.split(header);
         return parts.length > 1 ? parts[1] : '';
      };

      // Naive parsing based on the template structure in InputPage
      const rawDish1 = splitByHeader(content, '🍽️ Gerecht 1').split('🍽️ Gerecht 2')[0];
      const rawDish2 = splitByHeader(content, '🍽️ Gerecht 2').split('🥣 Soep')[0];
      const rawSoup = splitByHeader(content, '🥣 Soep');

      const renderBlock = (label: string, rawText: string) => (
        <div key={label} className="mb-6 last:mb-0 group">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-orange-800 font-serif text-lg border-b border-orange-200 inline-block pb-1">
              {label === 'Soep' ? '🥣 Soep' : `🍽️ ${label}`}
            </h3>
            <motion.button
               whileHover={{ scale: 1.1, rotate: 5 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => openPhotoModal(label)}
               className="p-2 bg-stone-100 rounded-full text-stone-500 hover:text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
               title={`Foto uploaden van ${label}`}
            >
              <Camera size={18} />
            </motion.button>
          </div>
          <div className="whitespace-pre-wrap text-stone-700 leading-relaxed pl-1">
             {rawText.trim()}
          </div>
        </div>
      );

      parsedBlocks.push(renderBlock('Gerecht 1', rawDish1));
      parsedBlocks.push(renderBlock('Gerecht 2', rawDish2));
      parsedBlocks.push(renderBlock('Soep', rawSoup));

      return <div>{parsedBlocks}</div>;
    }

    // Fallback for legacy data or freeform text
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-stone-700 font-medium">
        {menuText}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-10 md:space-y-14 pb-12">
        <PhotoUploadModal 
           isOpen={isPhotoModalOpen} 
           onClose={() => setIsPhotoModalOpen(false)} 
           dishName={selectedDishForPhoto} 
        />
        <ImageModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)} />

        <div className="text-center py-8 md:py-16 relative">
           <motion.div 
             initial={{ y: -80, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ type: "spring", stiffness: 60, damping: 20 }}
             className="inline-block px-2 relative z-10"
           >
             <h1 className="text-4xl md:text-7xl font-serif text-stone-800 mb-6 font-bold leading-tight tracking-tight drop-shadow-sm">
               Welkom bij <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] block md:inline">Prins Heerlijke Adviezen</span>
             </h1>
             <p className="text-base md:text-xl text-stone-600 italic max-w-2xl mx-auto font-medium">Uw dagelijkse bron van culinaire inspiratie en wijs advies</p>
           </motion.div>
        </div>

        <ScrollReveal delay={0.2}>
          <Card title={`Prins Heerlijk Menu van ${menuDisplayDate}`} icon={Utensils} type="menu" className="relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-orange-100 rounded-full opacity-30 blur-3xl pointer-events-none animate-pulse"></div>
             
             {loading ? (
               <LoadingSpinner />
             ) : menu && menu.formattedDate === today ? (
               <div className="relative z-10">
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                 >
                   {renderMenuContent(menu.items)}
                 </motion.div>
                 <div className="mt-6 flex items-center gap-2 text-xs md:text-sm text-stone-400 border-t border-orange-50 pt-4">
                    <Clock size={14} className="animate-[spin_60s_linear_infinite]" />
                    <span>Geüpdatet om {new Date(menu.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
               </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400 text-center">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
                    <Utensils size={48} className="mb-4 opacity-30" />
                  </motion.div>
                  <p className="text-lg font-serif italic mb-1">Het menu voor vandaag is nog niet ingevoerd.</p>
                  <p className="text-sm">Kom later terug voor smakelijke updates!</p>
                </div>
             )}
          </Card>
        </ScrollReveal>
        
        <ScrollReveal delay={0.3}>
          <Card title="Heeft Job vandaag burritos bij?" icon={Sandwich} type="burrito" className="border-orange-100">
             {loading ? (
               <LoadingSpinner />
             ) : burrito && burrito.formattedDate === today ? (
               <div className="flex flex-col items-center justify-center pt-8 pb-6 overflow-hidden">
                 <div className="mb-24 scale-110 md:scale-125 hover:scale-150 transition-transform duration-700 ease-in-out">
                   <BurritoOven hasBurritos={burrito.hasBurritos} />
                 </div>

                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 1.0, duration: 0.8 }}
                   className={`text-center space-y-2 ${burrito.hasBurritos ? 'text-green-700' : 'text-stone-500'}`}
                 >
                   <h3 className="text-2xl md:text-3xl font-serif font-bold">
                     {burrito.hasBurritos ? "Ja, zeker!" : "Helaas niet..."}
                   </h3>
                   <p className="text-stone-500 italic text-lg">
                      {burrito.hasBurritos ? "Vers uit de oven. Smullen maar! 🎉" : "De oven blijft vandaag leeg. 🥪"}
                   </p>
                 </motion.div>

                 <div className="mt-8 text-xs text-stone-400">
                    Geüpdatet om {new Date(burrito.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-8 text-stone-400 text-center">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                     <Sandwich size={48} className="mb-4 opacity-30" />
                  </motion.div>
                  <p className="text-lg font-serif italic">Job heeft nog niks laten weten.</p>
               </div>
             )}
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <Card title="Cyriel's Advies" icon={Sparkles} type="advice" className="bg-gradient-to-br from-white to-amber-50/50">
             {loading ? (
               <LoadingSpinner />
             ) : (advice && advice.formattedDate === today) ? (
               <div className="relative">
                 <div className="text-8xl absolute -top-6 -left-4 text-orange-200 font-serif opacity-40 select-none animate-pulse">"</div>
                 <p className="whitespace-pre-wrap text-lg md:text-2xl text-stone-700 italic pl-8 md:pl-10 pr-4 relative z-10 font-serif leading-loose">
                   {advice.advice}
                 </p>
                 
                 {/* Display Advice Photo if available */}
                 {advice.photoUrl && (
                   <motion.div 
                     whileHover={{ scale: 1.02 }}
                     onClick={handleAdvicePhotoClick}
                     className="mt-6 mx-auto max-w-md rounded-2xl overflow-hidden shadow-lg border-2 border-white/50 cursor-pointer"
                   >
                     <img src={advice.photoUrl} alt="Cyriel's Advies" className="w-full h-auto object-cover" />
                   </motion.div>
                 )}

                 <div className="mt-8 flex justify-end items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-stone-800 text-base">- Cyriel</p>
                      <p className="text-xs text-stone-400">{new Date(advice.timestamp).toLocaleDateString('nl-NL')}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-orange-900 font-bold font-serif text-xl shrink-0 shadow-lg border border-white">C</div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-stone-400 text-center">
                  <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 3 }}>
                    <Coffee size={48} className="mb-4" />
                  </motion.div>
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
  
  // New state for Advice Photo
  const [advicePhoto, setAdvicePhoto] = useState<File | null>(null);
  const [advicePhotoPreview, setAdvicePhotoPreview] = useState<string | null>(null);
  const adviceFileInputRef = useRef<HTMLInputElement>(null);
  const adviceCameraInputRef = useRef<HTMLInputElement>(null);

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
    setMenuData({ dish1: '', price1: '', dish2: '', price2: '', soup: '', priceSoup: '' });
    setAdviceContent('');
    setAdvicePhoto(null);
    setAdvicePhotoPreview(null);
    setBurritoStatus(null);
    setDataLoaded(false);
    setIsNewDay(false);
  }, [type]);

  useEffect(() => {
    const loadCurrentData = async () => {
      if (isLocked) return;

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
             if (latestAdvice.photoUrl) {
               setAdvicePhotoPreview(latestAdvice.photoUrl);
             }
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

  const handleAdvicePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setAdvicePhoto(selectedFile);
      setAdvicePhotoPreview(URL.createObjectURL(selectedFile));
    }
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
        let photoUrl = undefined;
        // Check if we already have a preview URL that IS a remote URL (from pre-loading existing data)
        if (advicePhotoPreview && advicePhotoPreview.startsWith('http') && !advicePhoto) {
          photoUrl = advicePhotoPreview;
        } 
        // Or if we have a new file to upload
        else if (advicePhoto) {
          photoUrl = await storage.uploadPhoto(advicePhoto);
        }

        await storage.saveAdvice(adviceContent, photoUrl);
      } else if (isBurritos) {
        if (burritoStatus === null) return;
        await storage.saveBurritoStatus(burritoStatus);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      setDataLoaded(true); 
      setIsNewDay(false);
    } catch (err) {
      console.error(err);
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
                <motion.div animate={authError ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setAuthError(false); }}
                    placeholder="Voer wachtwoord in..."
                    className={`w-full p-3 rounded-lg border ${authError ? 'border-red-300 bg-red-50 text-red-900' : 'border-stone-200 focus:border-orange-500'} outline-none transition-all shadow-inner`}
                    autoFocus
                  />
                  {authError && <p className="text-red-500 text-sm mt-2">Wachtwoord onjuist.</p>}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-stone-800 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex justify-center items-center gap-2 shadow-lg"
                >
                  <Unlock size={18} />
                  Ontgrendelen
                </motion.button>
              </form>
            </Card>
          </ScrollReveal>
        </div>
      </PageTransition>
    );
  }

  let title = "Invoer";
  let Icon = PenTool;
  let animType: 'menu' | 'advice' | 'burrito' | 'default' = 'default';
  
  if (isMenu) { title = "Voer Prins Heerlijk Menu In"; Icon = Utensils; animType = 'menu'; } 
  else if (isAdvice) { title = "Voer Cyriel's Advies In"; Icon = Coffee; animType = 'advice'; } 
  else if (isBurritos) { title = "Heeft Job Burritos bij?"; Icon = Sandwich; animType = 'burrito'; }
  
  let isValid = false;
  if (isMenu) isValid = (menuData.dish1 + menuData.price1 + menuData.dish2 + menuData.price2 + menuData.soup + menuData.priceSoup).length > 0;
  else if (isAdvice) isValid = adviceContent.trim().length > 0;
  else if (isBurritos) isValid = burritoStatus !== null;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto pb-12">
        <ScrollReveal>
          <Card title={title} icon={Icon} type={animType}>
            {isLoadingData ? (
               <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-orange-400" size={32} /></div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <AnimatePresence>
                {isNewDay && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-3 border border-blue-100 shadow-sm overflow-hidden">
                    <Sparkles size={18} className="shrink-0" />
                    <div><span className="font-bold">Nieuwe dag, nieuwe kansen!</span><p className="text-xs opacity-80">Het formulier is leeggemaakt voor vandaag.</p></div>
                  </motion.div>
                )}
                {dataLoaded && !isNewDay && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-green-100 overflow-hidden">
                    <CheckCircle2 size={16} /><span>Gegevens van vandaag ingeladen.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {isMenu && (
                <div className="space-y-4 md:space-y-6">
                   <ScrollReveal delay={0.2}>
                     <motion.div whileFocus={{ scale: 1.01 }} className="bg-stone-50 p-4 rounded-xl border border-stone-100 focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-100 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-orange-700 font-serif font-bold"><Utensils size={18} /><h3>Gerecht 1</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Omschrijving</label>
                            <input type="text" name="dish1" value={menuData.dish1} onChange={handleMenuChange} placeholder="Bijv. Ambachtelijke kroket" className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all text-sm md:text-base bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Prijs</label>
                            <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Euro size={16} className="text-stone-400" /></div><input type="text" name="price1" value={menuData.price1} onChange={handleMenuChange} placeholder="0,00" className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all text-sm md:text-base bg-white" /></div>
                          </div>
                        </div>
                     </motion.div>
                   </ScrollReveal>
                   <ScrollReveal delay={0.3}>
                     <motion.div whileFocus={{ scale: 1.01 }} className="bg-stone-50 p-4 rounded-xl border border-stone-100 focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-100 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-orange-700 font-serif font-bold"><Utensils size={18} /><h3>Gerecht 2</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                             <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Omschrijving</label>
                            <input type="text" name="dish2" value={menuData.dish2} onChange={handleMenuChange} placeholder="Bijv. Broodje Gezond" className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all text-sm md:text-base bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Prijs</label>
                            <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Euro size={16} className="text-stone-400" /></div><input type="text" name="price2" value={menuData.price2} onChange={handleMenuChange} placeholder="0,00" className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all text-sm md:text-base bg-white" /></div>
                          </div>
                        </div>
                     </motion.div>
                   </ScrollReveal>
                   <ScrollReveal delay={0.4}>
                     <motion.div whileFocus={{ scale: 1.01 }} className="bg-stone-50 p-4 rounded-xl border border-stone-100 focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-100 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3 text-orange-700 font-serif font-bold"><Soup size={18} /><h3>Soep</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Omschrijving</label>
                            <input type="text" name="soup" value={menuData.soup} onChange={handleMenuChange} placeholder="Bijv. Verse Pompoensoep" className="w-full p-3 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all text-sm md:text-base bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Prijs</label>
                            <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Euro size={16} className="text-stone-400" /></div><input type="text" name="priceSoup" value={menuData.priceSoup} onChange={handleMenuChange} placeholder="0,00" className="w-full p-3 pl-10 rounded-lg border border-stone-200 focus:border-orange-500 outline-none transition-all text-sm md:text-base bg-white" /></div>
                          </div>
                        </div>
                     </motion.div>
                   </ScrollReveal>
                </div>
              )}

              {isAdvice && (
                <ScrollReveal delay={0.2}>
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea value={adviceContent} onChange={(e) => setAdviceContent(e.target.value)} required rows={8} placeholder="Wat is het wijs advies van de dag?" className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-orange-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none font-medium text-stone-700 placeholder:text-stone-400 shadow-inner" />
                    </div>

                    {/* Photo Upload for Advice */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Foto toevoegen (Optioneel)</label>
                      {!advicePhotoPreview ? (
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => adviceCameraInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/50 hover:bg-orange-50 hover:border-orange-400 transition-colors gap-2 text-orange-700 group"
                          >
                            <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                              <Camera size={20} />
                            </div>
                            <span className="font-semibold text-xs">Camera</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => adviceFileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400 transition-colors gap-2 text-stone-600 group"
                          >
                            <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                              <ImageIcon size={20} />
                            </div>
                            <span className="font-semibold text-xs">Galerij</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-sm group w-full h-48">
                          <img src={advicePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => { setAdvicePhoto(null); setAdvicePhotoPreview(null); }}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      {/* Hidden Inputs */}
                      <input type="file" accept="image/*" capture="environment" ref={adviceCameraInputRef} className="hidden" onChange={handleAdvicePhotoChange} />
                      <input type="file" accept="image/*" ref={adviceFileInputRef} className="hidden" onChange={handleAdvicePhotoChange} />
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {isBurritos && (
                <ScrollReveal delay={0.2}>
                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center py-8">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => setBurritoStatus(true)} className={`w-40 h-40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 ${burritoStatus === true ? 'bg-green-500 text-white border-green-600 shadow-xl' : 'bg-white text-stone-400 border-stone-200 hover:border-green-300 hover:text-green-500'}`}>
                       <span className="text-3xl font-bold">JA</span><span className="text-sm opacity-80">Feest!</span>
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => setBurritoStatus(false)} className={`w-40 h-40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 ${burritoStatus === false ? 'bg-red-500 text-white border-red-600 shadow-xl' : 'bg-white text-stone-400 border-stone-200 hover:border-red-300 hover:text-red-500'}`}>
                       <span className="text-3xl font-bold">NEE</span><span className="text-sm opacity-80">Helaas...</span>
                    </motion.button>
                  </div>
                </ScrollReveal>
              )}

              <div className="flex justify-end pt-4 border-t border-stone-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!isValid || isSaving}
                  className="group relative w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-stone-800 to-stone-900 text-white rounded-full font-semibold shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                     {isSaving ? <Loader2 className="animate-spin" size={18}/> : isSaved ? "Opgeslagen!" : "Publiceren"} 
                     {!isSaving && !isSaved && <Save size={18} className="group-hover:scale-110 transition-transform" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className={`absolute inset-0 bg-green-500 transition-transform duration-500 origin-left ${isSaved ? 'scale-x-100' : 'scale-x-0'}`} />
                </motion.button>
              </div>
            </form>
            )}
          </Card>
        </ScrollReveal>
      </div>
    </PageTransition>
  );
};

const HistoryItem = ({ item, photos, onPhotoClick }: { item: any, photos: DishPhotoEntry[], onPhotoClick: (photo: DishPhotoEntry) => void }) => {
  // Check if item has a photoUrl property (it's an AdviceEntry)
  const advicePhotoUrl = (item as AdviceEntry).photoUrl;
  
  // If it's advice and has a photo, we can treat it somewhat like the gallery photos
  const handleAdvicePhotoClick = () => {
    if (advicePhotoUrl) {
      onPhotoClick({
        id: item.id,
        dateStr: item.dateStr,
        dishSection: "Cyriel's Advies",
        photoUrl: advicePhotoUrl,
        uploaderName: "Cyriel",
        comment: (item as AdviceEntry).advice,
        timestamp: item.timestamp
      });
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.01, x: 5 }} className="bg-white/80 backdrop-blur-sm p-5 md:p-6 rounded-xl shadow-sm border border-stone-100 hover:border-orange-200 hover:shadow-md transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-orange-500 shrink-0" />
            <h3 className="text-lg md:text-xl font-bold font-serif text-stone-800 capitalize">{item.formattedDate}</h3>
          </div>
          <div className="pl-4 md:pl-6 border-l-2 border-orange-100 group-hover:border-orange-300 transition-colors">
            <div className="text-stone-600 whitespace-pre-wrap text-sm md:text-base">{item.items || item.advice}</div>
            
            {/* Display Advice Photo in History */}
            {advicePhotoUrl && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={handleAdvicePhotoClick}
                className="mt-4 max-w-xs rounded-lg overflow-hidden shadow-sm cursor-pointer border border-stone-200"
              >
                 <img src={advicePhotoUrl} alt="Advies Foto" className="w-full h-auto object-cover" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Photo Gallery for this Day (Menu) */}
        {photos.length > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-100">
             <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Camera size={14} /> Foto's van deze dag
             </h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {photos.map(photo => (
                 <motion.div 
                   key={photo.id} 
                   whileHover={{ scale: 1.05 }} 
                   onClick={() => onPhotoClick(photo)}
                   className="relative group rounded-lg overflow-hidden shadow-sm aspect-square cursor-pointer"
                 >
                    <img src={photo.photoUrl} alt={photo.dishSection} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-xs">
                       <p className="font-bold">{photo.dishSection}</p>
                       <p className="opacity-80 truncate">door {photo.uploaderName}</p>
                    </div>
                 </motion.div>
               ))}
             </div>
          </div>
        )}
        
        <div className="text-xs font-mono text-stone-400 bg-stone-50 px-2 py-1 rounded self-end md:self-end">
          {new Date(item.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </motion.div>
  );
}

const HistoryPage = ({ type }: { type: 'menu' | 'advice' }) => {
  const [items, setItems] = useState<any[]>([]);
  const [allPhotos, setAllPhotos] = useState<DishPhotoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<DishPhotoEntry | null>(null);
  
  const title = type === 'menu' ? "Historie: Menu's" : "Historie: Adviezen";
  
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const raw = type === 'menu' ? await storage.getMenus() : await storage.getAdvices();
        setItems(storage.getUniqueHistory(raw as any));

        if (type === 'menu') {
           const uniqueItems = storage.getUniqueHistory(raw as any);
           const photoPromises = uniqueItems.map(item => storage.getDishPhotos(item.dateStr));
           const photosResults = await Promise.all(photoPromises);
           const flatPhotos = photosResults.flat();
           setAllPhotos(flatPhotos);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchHistory();
  }, [type]);

  return (
    <PageTransition>
      <ImageModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      
      <div className="space-y-8 pb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.0 }} className="flex items-center gap-4 mb-6 md:mb-8">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 1 }} className="p-3 bg-white rounded-full shadow-md text-orange-600">
            <History size={24} className="md:w-8 md:h-8" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight">{title}</h1>
        </motion.div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
        ) : items.length === 0 ? (
          <ScrollReveal><div className="text-center py-20 bg-white/60 backdrop-blur rounded-3xl border-2 border-dashed border-stone-200"><p className="text-stone-400 font-serif text-lg">Nog geen historie beschikbaar.</p></div></ScrollReveal>
        ) : (
          <div className="grid gap-6">
            {items.map((item, index) => (
              <ScrollReveal key={item.id} delay={index < 5 ? index * 0.1 : 0}>
                <HistoryItem 
                   item={item} 
                   photos={type === 'menu' ? allPhotos.filter(p => p.dateStr === item.dateStr) : []} 
                   onPhotoClick={(photo) => setSelectedPhoto(photo)}
                />
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
      <AnimatedBackground />
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