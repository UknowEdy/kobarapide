import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  darkMode: boolean;
}

const FAQItem = ({ question, answer, darkMode }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-4`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {question}
        </h3>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
        <div className={`mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'} text-base leading-relaxed`}>
          <p dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      )}
    </div>
  );
};

export default function FAQ({ darkMode }: { darkMode: boolean }) {
  const faqData = [
    {
      category: "Général",
      questions: [
        {
          question: "Qu'est-ce que Kobarapide ?",
          answer: "Kobarapide est une <strong>plateforme d'entraide sociale</strong> qui permet aux membres de s'entraider via des prêts solidaires. Notre objectif est de faciliter l'accès aux fonds pour des projets personnels ou professionnels grâce à un système de confiance basé sur le remboursement."
        },
        {
          question: "Comment fonctionne le système de score ?",
          answer: "Votre score (de 0 à 10) détermine le <strong>montant maximum</strong> que vous pouvez emprunter :<br>• Score 0-3 : Maximum 5 000 F<br>• Score 4-6 : Maximum 10 000 F<br>• Score 7-9 : Maximum 15 000 F<br>• Score 10 : Maximum 20 000 F<br><br>Le score augmente avec vos remboursements réussis et votre historique de confiance sur la plateforme."
        },
        {
          question: "Comment créer un compte ?",
          answer: "Sur la page d'accueil, cliquez sur <strong>Inscription</strong> et remplissez le formulaire avec :<br>• Votre email<br>• Un mot de passe sécurisé (min. 6 caractères)<br>• Nom et prénom<br>• Téléphone<br>• Numéro de pièce d'identité<br>• Date de naissance<br><br>Après validation, vous pourrez vous connecter immédiatement."
        },
        {
          question: "Le service est-il gratuit ?",
          answer: "L'inscription et l'utilisation de la plateforme sont <strong>gratuites</strong>. Seuls des <strong>frais de dossier de 5%</strong> sont appliqués sur chaque prêt demandé pour couvrir les coûts de traitement et de transfert."
        }
      ]
    },
    {
      category: "Demande de Prêt",
      questions: [
        {
          question: "Comment demander un prêt ?",
          answer: "Une fois connecté à votre compte :<br>1. Allez sur votre <strong>Tableau de bord</strong><br>2. Cliquez sur <strong>\"Faire une demande de prêt\"</strong><br>3. Sélectionnez le montant (multiples de 5 000 F uniquement)<br>4. Expliquez la raison de votre demande<br>5. Cliquez sur <strong>Soumettre</strong><br><br>Votre demande sera examinée par notre équipe dans les plus brefs délais."
        },
        {
          question: "Quels montants puis-je emprunter ?",
          answer: "Le montant dépend de votre <strong>score</strong> :<br>• Montants autorisés : <strong>5 000 F, 10 000 F, 15 000 F ou 20 000 F</strong><br>• Seuls les <strong>multiples de 5 000 F</strong> sont acceptés<br>• Exemple : Si votre score est 5, vous pouvez demander 5 000 F ou 10 000 F maximum"
        },
        {
          question: "Quels sont les frais appliqués ?",
          answer: "Des <strong>frais de dossier de 5%</strong> sont déduits du montant demandé :<br><br>Exemples :<br>• Demande de 5 000 F → Vous recevez <strong>4 750 F</strong> (5 000 - 250)<br>• Demande de 10 000 F → Vous recevez <strong>9 500 F</strong> (10 000 - 500)<br>• Demande de 15 000 F → Vous recevez <strong>14 250 F</strong> (15 000 - 750)"
        },
        {
          question: "Combien de temps pour obtenir une réponse ?",
          answer: "Notre équipe examine les demandes <strong>sous 24-48 heures</strong>. Vous recevrez une notification par email dès que votre demande est :<br>• <strong>Approuvée</strong> : prête pour déblocage<br>• <strong>Rejetée</strong> : avec la raison du refus<br><br>Consultez votre tableau de bord pour suivre l'état en temps réel."
        }
      ]
    },
    {
      category: "Remboursement",
      questions: [
        {
          question: "Comment fonctionne le remboursement ?",
          answer: "Le remboursement se fait en <strong>2 tranches égales de 50%</strong> :<br><br>• <strong>1ère tranche (50%)</strong> : à rembourser dans les <strong>30 jours</strong> suivant le déblocage<br>• <strong>2ème tranche (50%)</strong> : à rembourser dans les <strong>60 jours</strong> suivant le déblocage<br><br>Exemple : Prêt de 10 000 F<br>→ 1ère tranche : 5 000 F à J+30<br>→ 2ème tranche : 5 000 F à J+60"
        },
        {
          question: "Comment payer une échéance ?",
          answer: "Pour payer une échéance :<br>1. Allez dans <strong>Prêts en Cours</strong> sur votre tableau de bord<br>2. Cliquez sur <strong>\"Payer une échéance\"</strong><br>3. Effectuez le paiement via le moyen indiqué<br>4. <strong>Téléchargez une preuve de paiement</strong> (capture d'écran, reçu)<br>5. Soumettez la preuve pour validation<br><br>Notre équipe confirmera le paiement sous 24h."
        },
        {
          question: "Que se passe-t-il si je rate une échéance ?",
          answer: "En cas de retard :<br>• Vous recevrez un <strong>rappel par email</strong><br>• Votre <strong>score peut diminuer</strong><br>• Des <strong>pénalités</strong> peuvent s'appliquer<br>• Risque de <strong>suspension du compte</strong> en cas de retards répétés<br><br>💡 Conseil : Contactez-nous dès que possible si vous rencontrez des difficultés : <strong>contactkobarapide@gmail.com</strong>"
        },
        {
          question: "Comment augmenter mon score ?",
          answer: "Votre score augmente en :<br>• <strong>Remboursant vos prêts à temps</strong><br>• <strong>Complétant votre profil</strong> (pièce d'identité, selfie)<br>• <strong>Parrainant d'autres membres</strong> (jusqu'à 3 filleuls)<br>• <strong>Maintenant un bon historique</strong> sur la plateforme<br><br>Plus votre score est élevé, plus vous pouvez emprunter !"
        }
      ]
    },
    {
      category: "Compte et Sécurité",
      questions: [
        {
          question: "Comment modifier mon mot de passe ?",
          answer: "Pour changer votre mot de passe :<br>1. Connectez-vous à votre compte<br>2. Allez dans <strong>Paramètres</strong> ou <strong>Mon Profil</strong><br>3. Cliquez sur <strong>\"Changer le mot de passe\"</strong><br>4. Entrez votre <strong>ancien mot de passe</strong><br>5. Entrez votre <strong>nouveau mot de passe</strong> (min. 6 caractères)<br>6. Confirmez et enregistrez"
        },
        {
          question: "J'ai oublié mon mot de passe, que faire ?",
          answer: "Sur la page de connexion :<br>1. Cliquez sur <strong>\"Mot de passe oublié ?\"</strong><br>2. Entrez votre <strong>adresse email</strong><br>3. Vous recevrez un <strong>lien de réinitialisation</strong> par email<br>4. Cliquez sur le lien (valide 1 heure)<br>5. Créez un <strong>nouveau mot de passe</strong><br><br>⚠️ Si vous ne recevez pas l'email, vérifiez vos spams ou contactez-nous."
        },
        {
          question: "Mes données sont-elles sécurisées ?",
          answer: "Oui ! Nous prenons la sécurité très au sérieux :<br>• <strong>Cryptage SSL/TLS</strong> pour toutes les connexions<br>• <strong>Mots de passe hashés</strong> (jamais stockés en clair)<br>• <strong>Authentification sécurisée</strong> (tokens JWT)<br>• <strong>Vérification d'identité</strong> obligatoire<br>• <strong>Détection de doublons</strong> pour éviter les fraudes<br><br>Vos données personnelles ne sont jamais partagées avec des tiers."
        },
        {
          question: "Comment supprimer mon compte ?",
          answer: "Pour supprimer votre compte :<br>• Assurez-vous d'abord de <strong>rembourser tous vos prêts</strong><br>• Contactez notre support : <strong>contactkobarapide@gmail.com</strong><br>• Précisez votre demande de suppression<br><br>⚠️ La suppression est <strong>irréversible</strong> et entraîne la perte de votre historique et score."
        }
      ]
    },
    {
      category: "Parrainage",
      questions: [
        {
          question: "Comment fonctionne le parrainage ?",
          answer: "Après avoir <strong>remboursé votre premier prêt</strong>, vous recevez un <strong>code de parrainage unique</strong>. Vous pouvez alors inviter jusqu'à <strong>3 filleuls</strong> qui :<br>• Bénéficient d'un bonus à l'inscription<br>• Vous permettent d'augmenter votre score<br><br>Partagez votre code via le bouton <strong>\"Partager mon code\"</strong> sur votre tableau de bord."
        },
        {
          question: "Quels sont les avantages du parrainage ?",
          answer: "Avantages pour le <strong>parrain</strong> :<br>• <strong>Bonus de score</strong> pour chaque filleul actif<br>• <strong>Augmentation de votre crédibilité</strong> sur la plateforme<br><br>Avantages pour le <strong>filleul</strong> :<br>• <strong>Priorité</strong> dans l'examen des demandes<br>• <strong>Bonus de bienvenue</strong> potentiel"
        }
      ]
    },
    {
      category: "Support",
      questions: [
        {
          question: "Comment contacter le support ?",
          answer: "Plusieurs moyens de nous contacter :<br>• <strong>Email</strong> : contactkobarapide@gmail.com<br>• Délai de réponse : <strong>24-48 heures</strong><br><br>Pour une réponse rapide, précisez :<br>• Votre nom et email d'inscription<br>• La nature de votre problème<br>• Des captures d'écran si pertinent"
        },
        {
          question: "Que faire si j'ai un problème technique ?",
          answer: "En cas de problème technique :<br>1. <strong>Videz le cache</strong> de votre navigateur (Ctrl + Shift + R)<br>2. <strong>Essayez un autre navigateur</strong> (Chrome, Firefox, Safari)<br>3. <strong>Vérifiez votre connexion internet</strong><br>4. Si le problème persiste, contactez-nous : <strong>contactkobarapide@gmail.com</strong> avec :<br>   • Description du problème<br>   • Navigateur utilisé<br>   • Capture d'écran de l'erreur"
        },
        {
          question: "La plateforme est-elle disponible 24/7 ?",
          answer: "Oui, la plateforme est accessible <strong>24h/24, 7j/7</strong>. Cependant :<br>• Le <strong>traitement des demandes</strong> se fait aux heures ouvrables<br>• Le <strong>support</strong> répond sous 24-48h<br>• La <strong>validation des paiements</strong> peut prendre jusqu'à 24h<br><br>En cas de maintenance, une notification s'affiche sur le site."
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-koba-accent">
            ❓ Foire Aux Questions (FAQ)
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Trouvez rapidement des réponses à vos questions sur Kobarapide
          </p>
        </div>

        {/* FAQ par catégorie */}
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-10">
            <h2 className={`text-2xl font-bold mb-6 pb-2 border-b-2 ${
              darkMode ? 'text-koba-accent border-koba-accent' : 'text-koba-accent border-koba-accent'
            }`}>
              {category.category}
            </h2>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
              {category.questions.map((faq, questionIndex) => (
                <FAQItem
                  key={questionIndex}
                  question={faq.question}
                  answer={faq.answer}
                  darkMode={darkMode}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Contact Section */}
        <div className={`mt-12 p-6 rounded-lg ${
          darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-100 to-purple-100'
        }`}>
          <h3 className="text-xl font-bold mb-3">Vous ne trouvez pas de réponse ?</h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter !
          </p>
          <a
            href="mailto:contactkobarapide@gmail.com"
            className="inline-block bg-koba-accent text-white font-bold px-6 py-3 rounded-lg hover:opacity-80 transition"
          >
            📧 Contacter le Support
          </a>
        </div>
      </div>
    </div>
  );
}
