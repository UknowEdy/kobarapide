export default function Benefits() {
  const benefits = [
    {
      icon: "🤝",
      title: "Basé sur la confiance communautaire",
      description: "Pas de discrimination, juste votre historique d'entraide"
    },
    {
      icon: "📊",
      title: "Montants adaptés à votre score",
      description: "De 5 000 F à 20 000 F selon votre fiabilité"
    },
    {
      icon: "⚡",
      title: "Processus simple et rapide",
      description: "Inscription en 5 minutes, décision rapide"
    },
    {
      icon: "💎",
      title: "Frais transparents",
      description: "Seulement 5% de frais de dossier, sans intérêts cachés"
    },
    {
      icon: "📅",
      title: "Remboursements flexibles",
      description: "2 échéances de 30 jours, adaptées à votre situation"
    },
    {
      icon: "👥",
      title: "Système de parrainage",
      description: "Invitez vos proches et augmentez votre score"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-koba-bg to-koba-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-koba-accent mb-4">
            Pourquoi rejoindre KobaRapide ?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Une plateforme d'entraide sociale pensée pour vous et votre communauté
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-koba-card p-6 rounded-lg border border-koba-accent border-opacity-20 hover:border-opacity-50 transition-all duration-300 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="text-4xl mb-4">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-koba-text mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-koba-card bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm text-gray-300">Données sécurisées</p>
          </div>
          <div className="text-center p-4 bg-koba-card bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm text-gray-300">Inscription gratuite</p>
          </div>
          <div className="text-center p-4 bg-koba-card bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm text-gray-300">Réponse rapide</p>
          </div>
          <div className="text-center p-4 bg-koba-card bg-opacity-50 rounded-lg">
            <div className="text-2xl mb-2">💯</div>
            <p className="text-sm text-gray-300">Sans intérêts cachés</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-koba-accent mb-2">500+</div>
            <p className="text-gray-400">Membres actifs</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-koba-accent mb-2">98%</div>
            <p className="text-gray-400">Taux de satisfaction</p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-koba-accent mb-2">24h</div>
            <p className="text-gray-400">Réponse moyenne</p>
          </div>
        </div>
      </div>
    </section>
  );
}
