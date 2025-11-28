
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MenuEntry, AdviceEntry, BurritoEntry, DishPhotoEntry, DailyStatusEntry } from './types';
import * as storage from './services/storage';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import { Utensils, Coffee, Save, Calendar, Clock, Sparkles, History, Euro, Soup, Lock, Unlock, Loader2, CheckCircle2, Sandwich, PenTool, Camera, Image as ImageIcon, UploadCloud, X, ToggleLeft, ToggleRight, Star, ShoppingBag, ExternalLink } from 'lucide-react';

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
        className="hidden md:block absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[100px] will-change-transform" 
      />
      <motion.div 
        animate={{ 
          x: [0, -50, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
        className="hidden md:block absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px] will-change-transform" 
      />
      <motion.div 
        animate={{ 
          x: [0, 30, 0],
          y: [0, 30, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:block absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-rose-200/10 rounded-full blur-[80px] will-change-transform" 
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

const StatusDots = ({ status }: { status: DailyStatusEntry | null }) => {
  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  
  // If no status or status is old, we consider everything "reset" (null)
  const isCurrent = status && status.formattedDate === today;
  
  const getDotColorClass = (val: boolean | null | undefined) => {
    if (!isCurrent || val === null || val === undefined) return "bg-stone-200 border-stone-300 shadow-inner";
    if (val === true) return "bg-gradient-to-tr from-emerald-500 to-teal-400 border-emerald-300 shadow-lg shadow-emerald-500/30";
    return "bg-gradient-to-tr from-rose-500 to-pink-500 border-rose-300 shadow-lg shadow-rose-500/30";
  };

  const items = [
    { label: "Bengels", value: status?.bengels },
    { label: "Lekker vreten op kantoor?", value: status?.lekkerVreten },
    { label: "Korvel", value: status?.korvel },
    { label: "Visdag", value: status?.visdag },
    { label: "Heeft Job Burritos bij?", value: status?.burritos },
  ];

  return (
    <div className="flex flex-col md:grid md:grid-cols-5 gap-3 md:gap-4 w-full">
      {items.map((item, idx) => (
        <motion.div 
          key={idx}
          whileHover={{ y: -5 }}
          className="bg-white/90 backdrop-blur rounded-xl md:rounded-2xl p-4 flex flex-row md:flex-col items-center justify-between gap-4 shadow-lg border border-orange-50/50 relative overflow-hidden h-auto md:h-full"
        >
          <span className="text-sm font-bold text-stone-700 text-left md:text-center font-serif leading-tight z-10 flex-1 md:flex-none">{item.label}</span>
          <div className="relative z-10 shrink-0 md:mb-2">
             {/* Pulsating Ring (Outer Glow) */}
             {(isCurrent && (item.value === true || item.value === false)) && (
               <motion.div 
                 animate={{ scale: [1, 1.5], opacity: [0, 0.6, 0] }}
                 transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                 className={`absolute inset-0 rounded-full ${item.value ? 'bg-emerald-400' : 'bg-rose-400'}`}
               />
             )}
             
             {/* Main Dot */}
             <div
               className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-[10px] md:text-xs font-bold text-white relative z-10 ${getDotColorClass(item.value)}`}
             >
                {/* Inner shine - only visible if colored */}
                {(isCurrent && (item.value === true || item.value === false)) && (
                  <div className="absolute top-1 left-2 w-2 h-1 bg-white/40 rounded-full blur-[1px]"></div>
                )}
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// --- Burrito Plate 3D Animation ---
const BurritoPlate = ({ hasBurritos }: { hasBurritos: boolean }) => {
  return (
    <div className="w-full h-48 md:h-64 flex items-center justify-center relative perspective-[1000px]">
       <motion.div 
         initial={{ rotateX: 20, rotateY: 0 }}
         animate={{ rotateX: 20, rotateY: [0, 5, -5, 0] }}
         transition={{ rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
         className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-full shadow-2xl border-4 border-stone-100 flex items-center justify-center relative overflow-visible transform-style-3d"
       >
          {/* Inner Plate Shadow */}
          <div className="absolute inset-2 rounded-full border border-stone-100 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]"></div>

          {hasBurritos ? (
             <div className="relative w-full h-full flex items-center justify-center">
                 {/* Burrito 1 */}
                 <motion.div 
                   className="absolute w-28 h-10 md:w-40 md:h-14 rounded-full shadow-lg overflow-hidden flex left-1/2 -translate-x-1/2"
                   style={{ rotate: 45, y: -5, zIndex: 1 }}
                 >
                    <div className="w-1/2 h-full bg-[#E8CBA5]"></div>
                    <div className="w-1/2 h-full bg-gradient-to-r from-stone-300 via-white to-stone-300 border-l border-stone-300/50"></div>
                 </motion.div>
                 
                 {/* Burrito 2 */}
                 <motion.div 
                   className="absolute w-28 h-10 md:w-40 md:h-14 rounded-full shadow-lg overflow-hidden flex left-1/2 -translate-x-1/2"
                   style={{ rotate: -45, y: 5, zIndex: 2 }}
                 >
                    <div className="w-1/2 h-full bg-[#E8CBA5]"></div>
                    <div className="w-1/2 h-full bg-gradient-to-r from-stone-300 via-white to-stone-300 border-l border-stone-300/50"></div>
                 </motion.div>

                 {/* Smoke */}
                 {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full opacity-60 blur-md"
                      animate={{ y: [-10, -50], x: [0, (i-1)*15], opacity: [0.6, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                    />
                 ))}
             </div>
          ) : (
            <>
               <div className="absolute w-1 h-1 bg-amber-800 rounded-full top-1/2 left-1/2 -translate-x-4"></div>
               <div className="absolute w-1.5 h-1.5 bg-amber-700 rounded-full top-1/2 left-1/2 translate-x-2 translate-y-2"></div>
               <div className="absolute w-1 h-1 bg-amber-900 rounded-full top-1/2 left-1/2 translate-x-5 -translate-y-4 opacity-50"></div>
            </>
          )}
       </motion.div>
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
  const [rating, setRating] = useState(0); // 0 means no rating selected
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(null);
      setUploaderName('');
      setComment('');
      setRating(0);
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
    if (!file || !uploaderName || rating === 0) return;

    setIsUploading(true);
    try {
      const publicUrl = await storage.uploadPhoto(file);
      await storage.saveDishPhoto(dishName, publicUrl, uploaderName, comment, rating);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Uploaden mislukt. Probeer het opnieuw.");
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-center sticky top-0 bg-orange-50/95 backdrop-blur z-20">
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

              <div className="space-y-4">
                 {/* Star Rating Input */}
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Beoordeling (Verplicht)</label>
                   <div className="flex gap-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button
                         key={star}
                         type="button"
                         onClick={() => setRating(star)}
                         className="focus:outline-none transition-transform active:scale-95"
                       >
                         <Star 
                           size={32} 
                           className={`transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} 
                           strokeWidth={star <= rating ? 0 : 1.5}
                         />
                       </button>
                     ))}
                   </div>
                   {rating === 0 && <p className="text-xs text-orange-500 mt-1 font-medium">Selecteer een aantal sterren</p>}
                </div>

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
                disabled={!file || !uploaderName || rating === 0 || isUploading}
                className="w-full py-3 bg-stone-800 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={20} />}
                {isUploading ? "Uploaden..." : "Foto Opslaan"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const ImageModal = ({ photo, onClose }: { photo: DishPhotoEntry | null, onClose: () => void }) => {
  return createPortal(
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
                 loading="lazy"
                 decoding="async"
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
                       <div className="flex flex-col">
                          <p className="font-semibold text-stone-800">{photo.uploaderName}</p>
                          {/* Rating Display */}
                          {photo.rating > 0 && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < photo.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} strokeWidth={0} />
                              ))}
                            </div>
                          )}
                       </div>
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
    </AnimatePresence>,
    document.body
  );
};

// --- Bengels Page Component ---

const BengelsPage = () => {
  const menuCategories = [
    {
      title: "Koude Broodjes",
      anchor: "#290996",
      products: [
        { name: "Eiersalade", price: "5,50", img: "https://ntf.blob.core.windows.net/pictures/2-2358b910-236e-4a3a-91b5-8d2dcc2556bf.jpg" },
        { name: "Tonijnsalade", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-bc9f75a5-2921-4421-b8f5-067a050b6cd5.jpg" },
        { name: "Avocado, ei, tomaat", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-16141cb4-6b3f-46d2-a8f3-cc9ffbe4ff6f.jpg" },
        { name: "Caprese", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-16b6eecd-adb7-49fb-8160-42a84c07e434.jpg" },
        { name: "Gezond", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-04d891fe-79a2-47a6-ad85-6dc236d7b970.jpg" },
        { name: "Carpaccio", price: "6,50", img: "https://ntf.blob.core.windows.net/pictures/2-691aabc5-c917-4c55-aa6e-009b50bb98bb.jpg" },
        { name: "Kipsalade", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-3a93d729-48cd-41dc-938f-9e359a5262a3.jpg" },
        { name: "Zachtgegaarde kip", price: "7,00", img: "https://ntf.blob.core.windows.net/pictures/2-b35aaa71-c26d-4260-976a-dfbdfdbcd5ef.jpg" },
        { name: "Gerookte zalm", price: "7,50", img: "https://ntf.blob.core.windows.net/pictures/2-953ab929-4916-43e4-93af-7bdf7dc46f17.jpg" }
      ]
    },
    {
      title: "Warme Broodjes",
      anchor: "#290997",
      products: [
        { name: "Flatbread kaas", price: "4,50", img: "https://ntf.blob.core.windows.net/pictures/2-90be51f9-f0ae-4ca8-845e-f45d760d8b42.jpg" },
        { name: "Flatbread ham/kaas", price: "5,00", img: "https://ntf.blob.core.windows.net/pictures/2-52318a00-fc27-4c29-a232-86bb8858287f.jpg" },
        { name: "Flatbread caprese", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-49b1be7c-55a5-4bbc-87c1-a99ec91bb4b4.jpg" },
        { name: "Flatbread kip", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-058fccec-177a-42a9-abd6-ebe5e3df909b.jpg" },
        { name: "Flatbread rendang", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-21c12ccc-b7f2-4b4d-bb69-0ed1768a4d36.jpg" },
        { name: "Flatbread Tuna melt", price: "6,00", img: "https://ntf.blob.core.windows.net/pictures/2-4c410609-e987-4d72-b016-831d285f6142.jpg" }
      ]
    },
    {
      title: "Diversen",
      anchor: "#290998",
      products: [
        { name: "Salade Caprese", price: "8,00", img: "https://ntf.blob.core.windows.net/pictures/2-33862cb8-97a6-43ea-8dee-71e41237e616.jpg" },
        { name: "Salade Carpaccio", price: "8,50", img: "https://ntf.blob.core.windows.net/pictures/2-ec262f65-1087-4d98-be38-9ec8ac50a9ad.jpg" },
        { name: "Salade Kip Caesar", price: "8,50", img: "https://ntf.blob.core.windows.net/pictures/2-9054f82e-87c3-4d2c-998b-2930535ed364.jpg" },
        { name: "Soep van de dag", price: "3,50", img: "https://ntf.blob.core.windows.net/pictures/2-d0119a22-2572-4ca2-9051-ebd1eb927ac5.jpg" }
      ]
    },
    {
      title: "Pastry",
      anchor: "#290999",
      products: [
        { name: "Chocolate cookie", price: "2,80", img: "https://ntf.blob.core.windows.net/pictures/2-23d84fb3-05bd-4e13-b216-fd27118ae79b.jpg" },
        { name: "Bananenbrood", price: "3,20", img: "https://ntf.blob.core.windows.net/pictures/2-c601f5e3-eba4-41f3-a623-ebd29a9e0c17.jpg" },
        { name: "Croissant", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-27702778-5615-4798-a9a1-4d1d8b9fac17.jpg" },
        { name: "Notenbar", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-6de91699-3651-4bb7-9233-c90a38ccace0.jpg" },
        { name: "Brownie", price: "3,00", img: "https://ntf.blob.core.windows.net/pictures/2-2d1d0497-5509-49e5-98c6-3862a322e3ea.jpg" },
        { name: "Suikerwafel", price: "3,00", img: "https://ntf.blob.core.windows.net/pictures/2-05ff418a-071a-40fc-a407-f62fda690530.jpg" },
        { name: "Muffin pistache", price: "3,00", img: "https://ntf.blob.core.windows.net/pictures/2-aa6d258c-5bf7-47bf-9d49-325f4b9bdc0c.jpg" }
      ]
    },
    {
      title: "Lunchboxen",
      anchor: "#291148",
      products: [
        { name: "Lunchbox (per persoon)", price: "7,50", img: "https://ntf.blob.core.windows.net/pictures/2-f22a75a0-ba44-451f-b75a-4ea0a410882c.jpg" },
        { name: "Lunchbox incl. sappen", price: "10,00", img: "https://ntf.blob.core.windows.net/pictures/2-f22a75a0-ba44-451f-b75a-4ea0a410882c.jpg" },
        { name: "Lunchbox incl. zoetigheid", price: "10,00", img: "https://ntf.blob.core.windows.net/pictures/2-f22a75a0-ba44-451f-b75a-4ea0a410882c.jpg" },
        { name: "Lunchbox de luxe", price: "12,50", img: "https://ntf.blob.core.windows.net/pictures/2-f22a75a0-ba44-451f-b75a-4ea0a410882c.jpg" }
      ]
    },
    {
      title: "Dranken",
      anchor: "#291000",
      products: [
        { name: "Fruitsap sinaasappel-aardbei", price: "3,50", img: "https://ntf.blob.core.windows.net/pictures/2-f56b7025-7e47-4a7c-b3fb-b7222363d6d9.jpg" },
        { name: "Flesje jus", price: "3,00", img: "https://ntf.blob.core.windows.net/pictures/2-02d3e754-8dd5-4e8f-98e3-0617bd6e70af.jpg" },
        { name: "Smoothie mango-passie", price: "3,50", img: "https://ntf.blob.core.windows.net/pictures/2-6d576909-c97e-466d-af55-367b8564a729.jpg" },
        { name: "Koffie", price: "2,40", img: "https://ntf.blob.core.windows.net/pictures/2-01f00481-4d23-46b2-9393-5c576822507e.jpg" },
        { name: "Cappuccino", price: "2,90", img: "https://ntf.blob.core.windows.net/pictures/2-01f00481-4d23-46b2-9393-5c576822507e.jpg" },
        { name: "Latte macchiato", price: "3,10", img: "https://ntf.blob.core.windows.net/pictures/2-01f00481-4d23-46b2-9393-5c576822507e.jpg" },
        { name: "Koffie verkeerd", price: "3,10", img: "https://ntf.blob.core.windows.net/pictures/2-01f00481-4d23-46b2-9393-5c576822507e.jpg" },
        { name: "Chai Latte", price: "3,50", img: "https://ntf.blob.core.windows.net/pictures/2-448a52bc-122c-4dbc-962c-b1ab7ab6434c.jpg" },
        { name: "Coca cola (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-128bc045-fc9e-4fb8-a84f-20fad939434b.jpg" },
        { name: "Coca cola zero (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-5bfd73e3-3174-45d7-9955-228698afedb0.jpg" },
        { name: "Fanta cassis (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-96a0e993-6d2f-41bf-820e-bb9a934d1f63.jpg" },
        { name: "Fanta orange (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-5f785312-9cdd-49d1-994e-4cba8be5bf19.jpg" },
        { name: "Fuze tea green (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-6508aa5d-015c-407a-a56d-c6e0db95b0fe.jpg" },
        { name: "Fuze tea sparkling (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-7f0ac047-46ad-449a-9b70-65a4189333a5.jpg" },
        { name: "Sprite (33cl)", price: "2,50", img: "https://ntf.blob.core.windows.net/pictures/2-6ea54f28-fbb4-4a7d-89d0-f0af52de85c8.jpg" },
        { name: "Red Bull", price: "3,50", img: "https://ntf.blob.core.windows.net/pictures/2-352a218c-fd98-4e31-afd6-e7c696f14d03.jpg" }
      ]
    }
  ];

  const handleOrder = (anchor: string) => {
    // Navigate to the main bengels ordering page, ideally to the specific section
    window.open(`https://www.e-food.nl/skin/basic/tilburg/bengels-tilburg${anchor}`, '_blank');
  };

  return (
    <PageTransition>
      <div className="space-y-12 pb-12">
        <div className="text-center py-10">
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-block"
           >
              <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-stone-800 mb-4">
                Bengels <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-amber-600">Menu</span>
              </h1>
              <div className="h-1 w-24 bg-orange-400 mx-auto rounded-full" />
           </motion.div>
        </div>

        {menuCategories.map((category, idx) => (
          <ScrollReveal key={idx} delay={idx * 0.1}>
            <div className="mb-12 last:mb-0">
               <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-3 border-b border-orange-100 pb-2">
                 <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Utensils size={16} />
                 </div>
                 {category.title}
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.products.map((product, pIdx) => (
                    <motion.div 
                      key={pIdx}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-all flex flex-col h-full"
                    >
                       <div className="h-48 overflow-hidden bg-stone-50 relative group">
                          <img 
                            src={product.img} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       
                       <div className="p-5 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-stone-800 font-serif leading-tight">{product.name}</h3>
                             <span className="font-bold text-orange-600 shrink-0">€ {product.price}</span>
                          </div>
                          <div className="mt-auto pt-4">
                             <motion.button
                               whileHover={{ scale: 1.02 }}
                               whileTap={{ scale: 0.98 }}
                               onClick={() => handleOrder(category.anchor)}
                               className="w-full py-2 bg-stone-800 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                             >
                                <ExternalLink size={14} />
                                Bestel bij Bengels
                             </motion.button>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </PageTransition>
  );
};

// --- Pages ---

const HomePage = () => {
  const [menu, setMenu] = useState<MenuEntry | null>(null);
  const [advice, setAdvice] = useState<AdviceEntry | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyStatusEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Photo Upload State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedDishForPhoto, setSelectedDishForPhoto] = useState('');

  // Selected photo for ImageModal (can be from Advice)
  const [viewingPhoto, setViewingPhoto] = useState<DishPhotoEntry | null>(null);

  const today = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const loadData = async () => {
    const [latestMenu, latestAdvice, latestDailyStatus] = await Promise.all([
      storage.getLatestMenu(),
      storage.getLatestAdvice(),
      storage.getLatestDailyStatus()
    ]);
    setMenu(latestMenu);
    setAdvice(latestAdvice);
    setDailyStatus(latestDailyStatus);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const menuSub = storage.subscribeToMenuUpdates(loadData);
    const adviceSub = storage.subscribeToAdviceUpdates(loadData);
    const dailyStatusSub = storage.subscribeToDailyStatusUpdates(loadData);
    return () => { menuSub.unsubscribe(); adviceSub.unsubscribe(); dailyStatusSub.unsubscribe(); };
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
      rating: 0, // No rating for advice photos usually
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

        <div className="text-center py-12 md:py-20 relative perspective-[2000px]">
           {/* Background Glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 bg-orange-400/20 blur-[60px] rounded-full pointer-events-none" />

           <motion.h1 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1 }}
             className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-5xl md:text-8xl font-serif font-black tracking-tight leading-none"
           >
             {/* Word 1: Prins */}
             <motion.span 
               initial={{ opacity: 0, x: -50, rotateY: 90 }}
               animate={{ opacity: 1, x: 0, rotateY: 0 }}
               transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: 0.2 }}
               className="text-stone-800 drop-shadow-sm"
             >
               Prins
             </motion.span>
             
             {/* Word 2: Heerlijke (Gradient) */}
             <motion.span 
               initial={{ opacity: 0, y: -50, rotateX: 90 }}
               animate={{ opacity: 1, y: 0, rotateX: 0 }}
               transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: 0.4 }}
               className="text-transparent bg-clip-text bg-gradient-to-br from-orange-600 via-amber-500 to-orange-700 relative pb-2 md:pb-3"
             >
               Heerlijke
               {/* High-tech sparkle */}
               <motion.span 
                 animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0], rotate: [0, 90, 180] }}
                 transition={{ repeat: Infinity, duration: 2.5, delay: 1 }}
                 className="absolute -top-1 -right-6 text-amber-400 opacity-0 hidden md:block"
               >
                 <Sparkles size={32} strokeWidth={1.5} />
               </motion.span>
             </motion.span>

             {/* Word 3: Adviezen */}
             <motion.span 
               initial={{ opacity: 0, x: 50, rotateY: -90 }}
               animate={{ opacity: 1, x: 0, rotateY: 0 }}
               transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: 0.6 }}
               className="text-stone-800 italic"
             >
               Adviezen
             </motion.span>
           </motion.h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.2, duration: 0.8 }}
             className="mt-10 text-base md:text-xl text-stone-500 font-medium max-w-2xl mx-auto flex items-center justify-center gap-2"
           >
             <span className="hidden md:block w-8 h-[1px] bg-orange-300"></span>
             <span className="italic">Uw dagelijkse culinaire kompas</span>
             <span className="hidden md:block w-8 h-[1px] bg-orange-300"></span>
           </motion.p>
        </div>

        {/* Status Dots Section */}
        <ScrollReveal delay={0.1}>
           <StatusDots status={dailyStatus} />
        </ScrollReveal>

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
                     className="mt-6 mx-auto max-w-md rounded-2xl overflow-hidden shadow-sm border-2 border-white/50 cursor-pointer"
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

const InputPage = ({ type }: { type: 'menu' | 'advice' | 'other' }) => {
  const isMenu = type === 'menu';
  const isAdvice = type === 'advice';
  const isOther = type === 'other';
  
  const [isLocked, setIsLocked] = useState(isAdvice);
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
  const [advicePhoto, setAdvicePhoto] = useState<File | null>(null);
  const [advicePhotoPreview, setAdvicePhotoPreview] = useState<string | null>(null);
  const adviceFileInputRef = useRef<HTMLInputElement>(null);
  const adviceCameraInputRef = useRef<HTMLInputElement>(null);

  // New state for Other Options (consolidated)
  const [dailyStatus, setDailyStatus] = useState<{
    bengels: boolean | null, 
    lekkerVreten: boolean | null, 
    korvel: boolean | null,
    visdag: boolean | null,
    burritos: boolean | null
  }>({
    bengels: null, lekkerVreten: null, korvel: null, visdag: null, burritos: null
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isAdvice) {
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
    setDailyStatus({ bengels: null, lekkerVreten: null, korvel: null, visdag: null, burritos: null });
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
        } else if (isOther) {
           const latestStatus = await storage.getLatestDailyStatus();
           if (latestStatus && latestStatus.dateStr === currentValDateStr) {
             setDailyStatus({
                bengels: latestStatus.bengels,
                lekkerVreten: latestStatus.lekkerVreten,
                korvel: latestStatus.korvel,
                visdag: latestStatus.visdag,
                burritos: latestStatus.burritos
             });
             setDataLoaded(true);
             setIsNewDay(false);
           } else {
             setIsNewDay(true);
             // Ensure defaults are null
             setDailyStatus({ bengels: null, lekkerVreten: null, korvel: null, visdag: null, burritos: null });
           }
        }
      } catch (e) {
        console.error("Error loading existing data", e);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCurrentData();
  }, [isMenu, isAdvice, isOther, isLocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    let correctPassword = '';
    if (isAdvice) correctPassword = 'millofdastevehood';

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
        if (advicePhotoPreview && advicePhotoPreview.startsWith('http') && !advicePhoto) {
          photoUrl = advicePhotoPreview;
        } else if (advicePhoto) {
          photoUrl = await storage.uploadPhoto(advicePhoto);
        }
        await storage.saveAdvice(adviceContent, photoUrl);
      } else if (isOther) {
        await storage.saveDailyStatus(
          dailyStatus.bengels, 
          dailyStatus.lekkerVreten, 
          dailyStatus.korvel,
          dailyStatus.visdag,
          dailyStatus.burritos
        );
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
  else if (isOther) { title = "Overige Opties"; Icon = ToggleLeft; animType = 'default'; }
  
  let isValid = false;
  if (isMenu) isValid = (menuData.dish1 + menuData.price1 + menuData.dish2 + menuData.price2 + menuData.soup + menuData.priceSoup).length > 0;
  else if (isAdvice) isValid = adviceContent.trim().length > 0;
  else if (isOther) isValid = true; // Can save any state

  const ToggleBlock = ({ label, value, onChange }: { label: string, value: boolean | null, onChange: (val: boolean) => void }) => (
     <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center justify-between">
        <span className="font-serif font-bold text-stone-700">{label}</span>
        <div className="flex gap-2">
           <button 
             type="button"
             onClick={() => onChange(true)}
             className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${value === true ? 'bg-green-500 text-white shadow-md' : 'bg-white text-stone-400 border border-stone-200'}`}
           >
             JA
           </button>
           <button 
             type="button"
             onClick={() => onChange(false)}
             className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${value === false ? 'bg-red-500 text-white shadow-md' : 'bg-white text-stone-400 border border-stone-200'}`}
           >
             NEE
           </button>
        </div>
     </div>
  );

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

              {isOther && (
                <ScrollReveal delay={0.2}>
                  <div className="space-y-4">
                     <ToggleBlock 
                        label="Bengels" 
                        value={dailyStatus.bengels} 
                        onChange={(val) => setDailyStatus(prev => ({...prev, bengels: val}))} 
                     />
                     <ToggleBlock 
                        label="Lekker vreten op kantoor?" 
                        value={dailyStatus.lekkerVreten} 
                        onChange={(val) => setDailyStatus(prev => ({...prev, lekkerVreten: val}))} 
                     />
                     <ToggleBlock 
                        label="Korvel" 
                        value={dailyStatus.korvel} 
                        onChange={(val) => setDailyStatus(prev => ({...prev, korvel: val}))} 
                     />
                     <ToggleBlock 
                        label="Visdag" 
                        value={dailyStatus.visdag} 
                        onChange={(val) => setDailyStatus(prev => ({...prev, visdag: val}))} 
                     />
                     <ToggleBlock 
                        label="Heeft Job Burritos bij?" 
                        value={dailyStatus.burritos} 
                        onChange={(val) => setDailyStatus(prev => ({...prev, burritos: val}))} 
                     />
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
        rating: 0,
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
                 <img src={advicePhotoUrl} alt="Advies Foto" className="w-full h-auto object-cover" loading="lazy" decoding="async" />
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
                    <img src={photo.photoUrl} alt={photo.dishSection} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-xs">
                       <p className="font-bold">{photo.dishSection}</p>
                       <p className="opacity-80 truncate">door {photo.uploaderName}</p>
                       {/* Overlay Rating */}
                       {photo.rating > 0 && (
                          <div className="flex gap-0.5 mt-1">
                             <Star size={10} className="fill-amber-400 text-amber-400" strokeWidth={0} />
                             <span className="font-bold text-[10px]">{photo.rating}</span>
                          </div>
                       )}
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
        if (type === 'menu') {
           // Optimized fetch: Get menus and ALL photos in parallel to avoid N+1 problem
           const [rawMenus, allPhotosDB] = await Promise.all([
             storage.getMenus(),
             storage.getAllDishPhotos()
           ]);
           setItems(storage.getUniqueHistory(rawMenus));
           setAllPhotos(allPhotosDB);
        } else {
           const rawAdvice = await storage.getAdvices();
           setItems(storage.getUniqueHistory(rawAdvice));
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
          <Route path="/bengels" element={<BengelsPage />} />
          <Route path="/input/menu" element={<InputPage type="menu" />} />
          <Route path="/input/advice" element={<InputPage type="advice" />} />
          {/* Burritos removed as standalone, integrated into 'other' */}
          <Route path="/input/other" element={<InputPage type="other" />} />
          <Route path="/history/menu" element={<HistoryPage type="menu" />} />
          <Route path="/history/advice" element={<HistoryPage type="advice" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
