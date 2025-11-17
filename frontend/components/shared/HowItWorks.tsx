export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: "📝",
      title: "Inscrivez-vous",
      description: "Créez votre compte en quelques minutes. Fournissez vos informations et rejoignez notre communauté solidaire."
    },
    {
      number: 2,
      icon: "🤝",
      title: "Construisez votre score",
      description: "Votre score de confiance (0-10) détermine le montant maximum que vous pouvez emprunter. Il augmente quand vous remboursez vos prêts à temps."
    },
    {
      number: 3,
      icon: "💰",
      title: "Aidez et soyez aidé",
      description: "Demandez un prêt d'entraide selon votre score. Remboursez pour augmenter votre score et aider d'autres membres."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-koba-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-koba-accent mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Rejoignez KobaRapide en 3 étapes simples et commencez à bénéficier de l'entraide communautaire
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-koba-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-koba-accent text-koba-bg rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className="text-6xl mb-6 text-center">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-koba-accent mb-4 text-center">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-300 text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Arrow indicators (desktop only) */}
        <div className="hidden md:flex justify-center items-center gap-4 mt-8">
          <div className="flex-1 text-center">
            <div className="text-koba-accent text-2xl">→</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-koba-accent text-2xl">→</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button
            onClick={() => {
              const authForms = document.getElementById('auth-forms');
              authForms?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-koba-accent text-koba-bg px-8 py-4 rounded-lg font-bold text-lg hover:opacity-80 transition-opacity shadow-lg"
          >
            Commencer maintenant
          </button>
        </div>
      </div>
    </section>
  );
}
