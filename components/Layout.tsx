import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, ChefHat, History, Home, Coffee, ChevronDown, PenTool, Menu, X, Sandwich } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Desktop Components ---

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
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden"
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

// --- Mobile Components ---

const MobileNavLink = ({ to, children, icon: Icon, onClick }: { to: string; children: React.ReactNode; icon: any; onClick: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
        isActive ? 'bg-orange-100 text-orange-900 font-semibold' : 'text-stone-600 hover:bg-stone-50'
      }`}
    >
      <div className={`p-2 rounded-lg ${isActive ? 'bg-orange-200 text-orange-800' : 'bg-stone-100 text-stone-500'}`}>
        <Icon size={20} />
      </div>
      <span className="text-lg">{children}</span>
    </Link>
  );
};

const MobileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 px-4">{title}</h3>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-sans selection:bg-orange-200">
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group relative z-50">
              <div className="bg-orange-500 p-2 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ChefHat size={24} className="md:w-7 md:h-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold text-stone-800 font-serif leading-none group-hover:text-orange-700 transition-colors">
                  Prins Heerlijke
                </h1>
                <span className="text-sm md:text-base font-serif text-stone-600 -mt-1">Adviezen</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" icon={Home}>Home</NavLink>
              
              <Dropdown
                title="Menu Invoeren"
                icon={PenTool}
                items={[
                  { label: "Prins Heerlijk Menu", to: "/input/menu", icon: Utensils },
                  { label: "Cyriel's Advies", to: "/input/advice", icon: Coffee },
                  { label: "Burritos", to: "/input/burritos", icon: Sandwich },
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

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors relative z-50"
              aria-label="Menu openen"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X size={28} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu size={28} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-white md:hidden pt-24 px-4 pb-8 overflow-y-auto flex flex-col"
          >
            <div className="flex-grow max-w-md mx-auto w-full space-y-8">
              <MobileNavLink to="/" icon={Home} onClick={() => setIsMobileMenuOpen(false)}>Home</MobileNavLink>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-4" />
              
              <MobileSection title="Menu Invoeren">
                <MobileNavLink to="/input/menu" icon={Utensils} onClick={() => setIsMobileMenuOpen(false)}>Prins Heerlijk Menu</MobileNavLink>
                <MobileNavLink to="/input/advice" icon={Coffee} onClick={() => setIsMobileMenuOpen(false)}>Cyriel's Advies</MobileNavLink>
                <MobileNavLink to="/input/burritos" icon={Sandwich} onClick={() => setIsMobileMenuOpen(false)}>Burritos</MobileNavLink>
              </MobileSection>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent my-4" />

              <MobileSection title="Historie">
                <MobileNavLink to="/history/menu" icon={History} onClick={() => setIsMobileMenuOpen(false)}>Menu Historie</MobileNavLink>
                <MobileNavLink to="/history/advice" icon={History} onClick={() => setIsMobileMenuOpen(false)}>Advies Historie</MobileNavLink>
              </MobileSection>
            </div>

            <div className="mt-auto text-center pt-8 pb-4 opacity-50">
               <ChefHat size={40} className="mx-auto mb-2 text-stone-300" />
               <p className="font-serif italic text-stone-400">Smakelijk eten</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-orange-100 mt-auto relative z-0">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-stone-500 text-sm">
          <p className="font-serif italic text-lg text-orange-800/60 mb-2">"Smakelijk eten en wijs advies"</p>
          <p>&copy; {new Date().getFullYear()} Prins Heerlijke Adviezen.</p>
        </div>
      </footer>
    </div>
  );
};