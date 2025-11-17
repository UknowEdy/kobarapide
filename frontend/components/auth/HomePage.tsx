import { useState } from 'react';
import { useAppContext } from '../../context/DataContext';
import LoadingSpinner from '../shared/LoadingSpinner';
import Navbar from '../shared/Navbar';
import HowItWorks from '../shared/HowItWorks';
import Benefits from '../shared/Benefits';
import FAQHome from '../shared/FAQHome';
import Footer from '../shared/Footer';

export default function HomePage() {
  const { login, loading } = useAppContext();

  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Register
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerNom, setRegisterNom] = useState('');
  const [registerPrenom, setRegisterPrenom] = useState('');
  const [registerTel, setRegisterTel] = useState('');
  const [registerPiece, setRegisterPiece] = useState('');
  const [registerDate, setRegisterDate] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 10) return { strength: 2, label: 'Moyen', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(registerPassword);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
      if (rememberMe) {
        localStorage.setItem('rememberEmail', loginEmail);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!acceptTerms) {
      setRegisterError('❌ Vous devez accepter les conditions d\'utilisation');
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      setRegisterError('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('❌ Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          nom: registerNom,
          prenom: registerPrenom,
          telephone: registerTel,
          pieceIdentite: registerPiece,
          dateDeNaissance: registerDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Échec de l\'inscription');
      }

      setRegisterSuccess('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
      // Reset form
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterPasswordConfirm('');
      setRegisterNom('');
      setRegisterPrenom('');
      setRegisterTel('');
      setRegisterPiece('');
      setRegisterDate('');
      setAcceptTerms(false);
    } catch (err: any) {
      setRegisterError(`❌ ${err.message || 'Échec de l\'inscription'}`);
    }
  };

  return (
    <div className="min-h-screen bg-koba-bg">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <img src="/icon-192x192.png" alt="Kobarapide" className="w-32 h-32 mx-auto mb-8 animate-pulse" />

          <h1 className="text-5xl md:text-6xl font-bold text-koba-text mb-6">
            Entraide et Solidarité
            <br />
            <span className="text-koba-accent">Communautaire</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Rejoignez un réseau de confiance où chacun peut aider et être aidé
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => {
                const authForms = document.getElementById('auth-forms');
                authForms?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-koba-accent text-koba-bg px-8 py-4 rounded-lg font-bold text-lg hover:opacity-80 transition-opacity shadow-lg"
            >
              Rejoindre la communauté
            </button>
            <button
              onClick={() => {
                const howItWorks = document.getElementById('how-it-works');
                howItWorks?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-koba-accent text-koba-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-koba-accent hover:text-koba-bg transition-all"
            >
              En savoir plus
            </button>
          </div>

          {/* Mission Statement */}
          <div className="mt-16 max-w-3xl mx-auto bg-koba-card p-8 rounded-xl border border-koba-accent border-opacity-20">
            <h3 className="text-2xl font-bold text-koba-accent mb-4">Notre Mission</h3>
            <p className="text-gray-300 leading-relaxed">
              Faciliter l'entraide et la solidarité entre membres d'une même communauté grâce à des prêts
              d'entraide basés sur la confiance mutuelle. Nous ne sommes pas une banque, nous sommes une
              <strong className="text-koba-accent"> plateforme d'entraide sociale</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Benefits Section */}
      <Benefits />

      {/* FAQ Section */}
      <FAQHome />

      {/* Auth Forms Section */}
      <section id="auth-forms" className="py-20 bg-gradient-to-b from-koba-bg to-koba-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-koba-accent mb-4">
              Commencez votre voyage solidaire
            </h2>
            <p className="text-gray-400 text-lg">
              Connectez-vous ou créez votre compte en quelques minutes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

            {/* Login Form */}
            <div className="bg-koba-card p-8 rounded-xl shadow-lg border border-koba-accent border-opacity-20">
              <h2 className="text-2xl font-bold text-koba-accent mb-6">Connexion</h2>

              {loginError && (
                <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-koba-text mb-2 font-semibold">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full p-3 bg-koba-bg text-koba-text rounded-lg border border-koba-accent focus:border-koba-accent focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-koba-text mb-2 font-semibold">Mot de passe</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full p-3 bg-koba-bg text-koba-text rounded-lg border border-koba-accent focus:border-koba-accent focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-koba-accent"
                    />
                    <span className="text-sm text-gray-400">Se souvenir de moi</span>
                  </label>
                  <a href="#" className="text-sm text-koba-accent hover:underline" onClick={(e) => e.preventDefault()}>
                    Mot de passe oublié ?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-koba-accent text-koba-bg font-bold py-3 rounded-lg hover:opacity-80 disabled:opacity-50 flex justify-center items-center transition-all"
                >
                  {loading ? <LoadingSpinner /> : 'Se connecter'}
                </button>
              </form>

              <p className="text-gray-400 text-sm mt-6 text-center">
                Pas encore membre ?{' '}
                <button
                  onClick={() => {
                    const registerForm = document.querySelector('[data-form="register"]');
                    registerForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="text-koba-accent hover:underline font-semibold"
                >
                  S'inscrire
                </button>
              </p>

              <p className="text-gray-400 text-xs mt-4 text-center border-t border-gray-700 pt-4">
                Besoin d'aide ? Contactez-nous : <br />
                <a href="mailto:contactkobarapide@gmail.com" className="text-koba-accent hover:underline">
                  contactkobarapide@gmail.com
                </a>
              </p>
            </div>

            {/* Register Form */}
            <div data-form="register" className="bg-koba-card p-8 rounded-xl shadow-lg border border-koba-accent border-opacity-20">
              <h2 className="text-2xl font-bold text-koba-accent mb-6">Inscription</h2>

              {registerError && (
                <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">
                  {registerError}
                </div>
              )}

              {registerSuccess && (
                <div className="bg-green-600 text-white p-3 rounded mb-4 text-sm">
                  {registerSuccess}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Email *</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Mot de passe * (min. 6 caractères)</label>
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mot de passe"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                      minLength={6}
                    />
                    {registerPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          <div className={`h-1 flex-1 rounded ${passwordStrength.strength >= 1 ? passwordStrength.color : 'bg-gray-600'}`}></div>
                          <div className={`h-1 flex-1 rounded ${passwordStrength.strength >= 2 ? passwordStrength.color : 'bg-gray-600'}`}></div>
                          <div className={`h-1 flex-1 rounded ${passwordStrength.strength >= 3 ? passwordStrength.color : 'bg-gray-600'}`}></div>
                        </div>
                        <p className="text-xs text-gray-400">Force : {passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Confirmer mot de passe *</label>
                    <input
                      type="password"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                    {registerPasswordConfirm && registerPassword !== registerPasswordConfirm && (
                      <p className="text-xs text-red-400 mt-1">❌ Les mots de passe ne correspondent pas</p>
                    )}
                    {registerPasswordConfirm && registerPassword === registerPasswordConfirm && (
                      <p className="text-xs text-green-400 mt-1">✅ Les mots de passe correspondent</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Nom *</label>
                    <input
                      type="text"
                      value={registerNom}
                      onChange={(e) => setRegisterNom(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Prénom *</label>
                    <input
                      type="text"
                      value={registerPrenom}
                      onChange={(e) => setRegisterPrenom(e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Téléphone *</label>
                    <input
                      type="tel"
                      value={registerTel}
                      onChange={(e) => setRegisterTel(e.target.value)}
                      placeholder="06XXXXXXXX"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Pièce d'identité *</label>
                    <input
                      type="text"
                      value={registerPiece}
                      onChange={(e) => setRegisterPiece(e.target.value)}
                      placeholder="Numéro de pièce"
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-koba-text mb-1 text-sm font-semibold">Date de naissance *</label>
                    <input
                      type="date"
                      value={registerDate}
                      onChange={(e) => setRegisterDate(e.target.value)}
                      className="w-full p-2 bg-koba-bg text-koba-text rounded border border-koba-accent text-sm focus:ring-2 focus:ring-koba-accent focus:ring-opacity-50 outline-none"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-4 h-4 mt-1 accent-koba-accent"
                        required
                      />
                      <span className="text-xs text-gray-400">
                        J'accepte les{' '}
                        <a href="#" className="text-koba-accent hover:underline" onClick={(e) => e.preventDefault()}>
                          conditions d'utilisation
                        </a>
                        {' '}et la{' '}
                        <a href="#" className="text-koba-accent hover:underline" onClick={(e) => e.preventDefault()}>
                          politique de confidentialité
                        </a>
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!acceptTerms}
                  className="w-full bg-koba-accent text-koba-bg font-bold py-2 rounded-lg hover:opacity-80 text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  S'inscrire
                </button>
              </form>

              <p className="text-gray-400 text-sm mt-6 text-center">
                Déjà membre ?{' '}
                <button
                  onClick={() => {
                    const loginForm = document.querySelector('form');
                    loginForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="text-koba-accent hover:underline font-semibold"
                >
                  Se connecter
                </button>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
