export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-koba-card border-t border-koba-accent border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: À propos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/icon-192x192.png" alt="Kobarapide" className="w-10 h-10" />
              <h3 className="text-xl font-bold text-koba-accent">KobaRapide</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plateforme d'entraide sociale basée sur la confiance communautaire. Ensemble, construisons un réseau solidaire.
            </p>
          </div>

          {/* Section 2: Liens rapides */}
          <div>
            <h4 className="text-lg font-semibold text-koba-text mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('hero')}
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                >
                  Comment ça marche
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('auth-forms')}
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                >
                  Connexion
                </button>
              </li>
            </ul>
          </div>

          {/* Section 3: Légal */}
          <div>
            <h4 className="text-lg font-semibold text-koba-text mb-4">Informations légales</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>

          {/* Section 4: Contact */}
          <div>
            <h4 className="text-lg font-semibold text-koba-text mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-koba-accent">📧</span>
                <a
                  href="mailto:contactkobarapide@gmail.com"
                  className="text-gray-400 hover:text-koba-accent transition-colors text-sm"
                >
                  contactkobarapide@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-koba-accent">📍</span>
                <span className="text-gray-400 text-sm">
                  Communauté d'Entraide Sociale
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2025 KobaRapide. Tous droits réservés.
            </p>

            {/* Social & Trust */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✅</span>
                <span>Vérifié</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🤝</span>
                <span>Confiance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
