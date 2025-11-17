import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group"
      >
        <h3 className="font-semibold text-lg text-koba-text group-hover:text-koba-accent transition-colors">
          {question}
        </h3>
        <svg
          className={`w-5 h-5 text-koba-accent transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-3 text-gray-300 text-base leading-relaxed">
          <p dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  );
};

export default function FAQHome() {
  const faqData = [
    {
      question: "Qu'est-ce que KobaRapide ?",
      answer: "KobaRapide est une <strong>plateforme d'entraide sociale</strong> permettant aux membres d'une communauté de s'entraider via des prêts solidaires basés sur la confiance mutuelle. Nous ne sommes pas une banque ni une institution de microfinance."
    },
    {
      question: "Comment fonctionne le système de score ?",
      answer: "Votre score de confiance va de <strong>0 à 10</strong>. Il détermine le montant maximum que vous pouvez emprunter :<br>• Score 0-3 : Maximum 5 000 F<br>• Score 4-6 : Maximum 10 000 F<br>• Score 7-9 : Maximum 15 000 F<br>• Score 10 : Maximum 20 000 F<br><br>Votre score augmente quand vous remboursez vos prêts à temps."
    },
    {
      question: "Quels sont les frais ?",
      answer: "Nous prélevons seulement <strong>5% de frais de dossier</strong> et de transfert sur le montant demandé. Par exemple, si vous demandez 10 000 F, vous recevrez <strong>9 500 F</strong> (10 000 - 500). <strong>Aucun intérêt n'est facturé</strong>."
    },
    {
      question: "Combien puis-je emprunter ?",
      answer: "Le montant dépend de votre score de confiance. Vous pouvez emprunter uniquement des <strong>multiples de 5 000 F</strong> (5 000, 10 000, 15 000 ou 20 000 F selon votre score)."
    },
    {
      question: "Comment rembourser mon prêt ?",
      answer: "Chaque prêt est remboursable en <strong>2 échéances de 30 jours</strong> chacune :<br>• 1ère tranche (50%) : 30 jours après déblocage<br>• 2ème tranche (50%) : 60 jours après déblocage<br><br>Vous recevrez des notifications avant chaque échéance. Remboursez à temps pour augmenter votre score !"
    },
    {
      question: "Qui peut s'inscrire ?",
      answer: "Toute personne <strong>majeure</strong> avec une <strong>pièce d'identité valide</strong> peut s'inscrire. L'inscription est <strong>gratuite</strong> et ne prend que quelques minutes."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, absolument. Nous utilisons un <strong>cryptage de niveau bancaire</strong> pour protéger vos données personnelles et financières. Vos informations ne sont <strong>jamais partagées avec des tiers</strong>."
    },
    {
      question: "Comment augmenter mon score ?",
      answer: "Votre score augmente de plusieurs façons :<br>• Remboursez vos prêts <strong>à temps</strong><br>• Complétez votre profil<br>• Parrainez de nouveaux membres<br>• Restez actif sur la plateforme"
    },
    {
      question: "Que se passe-t-il si je ne peux pas rembourser ?",
      answer: "Nous comprenons que des imprévus arrivent. <strong>Contactez-nous immédiatement</strong> si vous avez des difficultés. Nous travaillerons ensemble pour trouver une solution. Cependant, les retards affectent votre score de confiance."
    },
    {
      question: "Comment fonctionne le parrainage ?",
      answer: "Après votre <strong>premier prêt remboursé avec succès</strong>, vous recevrez un code de parrainage unique. Partagez-le avec vos proches. Chaque personne que vous parrainez améliore votre score de confiance."
    },
    {
      question: "Combien de temps pour recevoir mon prêt ?",
      answer: "Une fois votre demande <strong>approuvée</strong> par notre équipe (généralement sous <strong>24-48h</strong>), le montant est transféré sous <strong>1-2 jours ouvrés</strong>."
    },
    {
      question: "Y a-t-il des intérêts ?",
      answer: "<strong>Non !</strong> Nous ne facturons <strong>AUCUN intérêt</strong>. Seulement les 5% de frais de dossier. Si vous empruntez 10 000 F, vous remboursez exactement <strong>10 000 F</strong> (en 2 fois)."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-koba-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-koba-accent mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-gray-400 text-lg">
            Tout ce que vous devez savoir sur KobaRapide
          </p>
        </div>

        {/* FAQ Items */}
        <div className="bg-koba-card p-8 rounded-xl shadow-lg">
          <div className="space-y-2">
            {faqData.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-koba-card bg-opacity-50 p-8 rounded-xl border border-koba-accent border-opacity-20">
          <h3 className="text-xl font-bold text-koba-text mb-3">
            Vous avez d'autres questions ?
          </h3>
          <p className="text-gray-400 mb-6">
            Notre équipe est là pour vous aider
          </p>
          <a
            href="mailto:contactkobarapide@gmail.com"
            className="inline-flex items-center gap-2 bg-koba-accent text-koba-bg px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
          >
            <span>📧</span>
            <span>Contactez-nous</span>
          </a>
        </div>
      </div>
    </section>
  );
}
