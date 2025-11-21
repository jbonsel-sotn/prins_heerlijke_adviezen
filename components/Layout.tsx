import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, ChefHat, History, Home, Coffee, ChevronDown, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NavLink = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon: any }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group hover:bg-orange-100 ${
        isActive ? 'bg-orange-200 text-orange-900 font-semibold shadow-inner' : 'text-stone-700 hover:text-orange-800'
      }`}
    >
      <Icon size={18} className="group-hover:rotate-12 transition-transform duration-300" />
      <span>{children}</span>
    </Link>
  );
};

const Dropdown = ({ title, icon: Icon, items }: { title: string; icon: any; items: { to: string; label: string; icon: any }[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <div className="relative z-50" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-stone-700 hover:text-orange-800 hover:bg-orange-100 ${isOpen ? 'bg-orange-50' : ''}`}
      >
        <Icon size={18} className="transition-transform duration-300" />
        <span>{title}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden"
          >
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-stone-600 hover:text-orange-700 transition-colors border-b border-orange-50/50 last:border-0"
              >
                 <item.icon size={16} className="text-orange-400" />
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-sans selection:bg-orange-200">
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-orange-500 p-2 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ChefHat size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800 font-serif leading-none group-hover:text-orange-700 transition-colors">
                  Prins Heerlijke Adviezen
                </h1>
                <p className="text-xs text-orange-600 font-semibold tracking-widest uppercase">Adviezen & Menu's</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" icon={Home}>Home</NavLink>
              
              <Dropdown
                title="Menu Invoeren"
                icon={PenTool}
                items={[
                  { label: "Prins Heerlijk Menu", to: "/input/menu", icon: Utensils },
                  { label: "Cyriel's Advies", to: "/input/advice", icon: Coffee },
                ]}
              />

              <Dropdown
                title="Historie"
                icon={History}
                items={[
                  { label: "Prins Heerlijk Menu", to: "/history/menu", icon: Utensils },
                  { label: "Cyriel's Adviezen", to: "/history/advice", icon: Coffee },
                ]}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-orange-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-stone-500 text-sm">
          <p className="font-serif italic text-lg text-orange-800/60 mb-2">"Smakelijk eten en wijs advies"</p>
          <p>&copy; {new Date().getFullYear()} Prins Heerlijke Adviezen. Ambachtelijk ontwikkeld.</p>
        </div>
      </footer>
    </div>
  );
};