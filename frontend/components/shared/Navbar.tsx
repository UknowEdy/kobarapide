import { useState } from 'react';

interface NavbarProps {
  onNavigate?: (section: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-koba-bg bg-opacity-95 backdrop-blur-sm border-b border-koba-accent border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <img src="/icon-192x192.png" alt="Kobarapide" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-koba-accent">Kobarapide</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Entraide Sociale</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-koba-text hover:text-koba-accent transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-koba-text hover:text-koba-accent transition-colors"
            >
              Comment ça marche
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-koba-text hover:text-koba-accent transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('auth-forms')}
              className="bg-koba-accent text-koba-bg px-6 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            >
              Connexion
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-koba-text p-2"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-koba-accent border-opacity-20">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left px-4 py-2 text-koba-text hover:text-koba-accent hover:bg-koba-card rounded transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-4 py-2 text-koba-text hover:text-koba-accent hover:bg-koba-card rounded transition-colors"
            >
              Comment ça marche
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left px-4 py-2 text-koba-text hover:text-koba-accent hover:bg-koba-card rounded transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('auth-forms')}
              className="block w-full text-center bg-koba-accent text-koba-bg px-6 py-2 rounded-lg font-semibold hover:opacity-80 transition-opacity"
            >
              Connexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
