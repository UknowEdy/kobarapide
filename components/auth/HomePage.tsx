import React, { useState } from 'react';
import Card from '../shared/Card';
import { useAppContext } from '../../context/DataContext';

// This component is defined outside of HomePage to prevent it from re-rendering
// and losing focus on every state change in the parent component.
const InputField: React.FC<{
    name: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
}> = ({ name, type, placeholder, value, onChange, error, required = true }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const inputType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

    return (
        <div className="relative">
            <label htmlFor={name} className="sr-only">{placeholder}</label>
            <input
                id={name}
                name={name}
                type={inputType}
                required={required}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-koba-accent ${error ? 'border-red-500' : 'border-gray-600'} ${isPassword ? 'pr-10' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                    aria-label={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                    {isPasswordVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            <path d="M2 10s3.939 4 8 4 8-4 8-4-3.939-4-8-4-8 4-8 4zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    )}
                </button>
            )}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};


const HomePage: React.FC = () => {
    const { login, registerUser, isUpdating } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [registerMessage, setRegisterMessage] = useState({ text: '', type: 'info' });
    
    const [registerForm, setRegisterForm] = useState({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        telephone: '',
        pieceIdentite: '',
        dateDeNaissance: '',
        referralCode: '',
    });
     const [formErrors, setFormErrors] = useState<Partial<typeof registerForm>>({});

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        if (!email || !password) {
            setLoginError("L'email et le mot de passe sont requis.");
            return;
        }
        const result = login(email, password);
        if (result.error === 'not_found' || result.error === 'wrong_password') {
            setLoginError('Email ou mot de passe incorrect.');
        } else if (result.error === 'email_not_verified') {
            setLoginError('Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception.');
        } else if (result.error === 'account_rejected') {
            const baseMessage = 'Votre inscription a été rejetée.';
            const reasonMessage = result.reason ? ` Raison : "${result.reason}"` : '';
            setLoginError(baseMessage + reasonMessage);
        }
    };
    
    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterForm({
            ...registerForm,
            [e.target.name]: e.target.value
        });
        if (formErrors[e.target.name as keyof typeof formErrors]) {
            setFormErrors({ ...formErrors, [e.target.name]: undefined });
        }
    };

    const validateForm = (): boolean => {
        const errors: Partial<typeof registerForm> = {};
        let isValid = true;
        (Object.keys(registerForm) as Array<keyof typeof registerForm>).forEach((key) => {
             if (key !== 'referralCode' && !registerForm[key]) {
                 errors[key] = "Ce champ est requis";
                 isValid = false;
             }
        });
         if (registerForm.email && !/\S+@\S+\.\S+/.test(registerForm.email)) {
            errors.email = "Format d'email invalide";
            isValid = false;
        }
        if (registerForm.password && registerForm.password.length < 6) {
            errors.password = "Le mot de passe doit faire au moins 6 caractères";
            isValid = false;
        }
        setFormErrors(errors);
        return isValid;
    };
    
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setRegisterMessage({ text: '', type: 'info' });
        const result = await registerUser({
            ...registerForm,
            dateInscription: new Date().toISOString(),
            dateDerniereActivite: new Date().toISOString(),
        });

        if (result.status === 'duplicate') {
            setRegisterMessage({ text: "Votre inscription a été reçue et est en cours de traitement en raison de similarités avec un compte existant.", type: 'info' });
        } else if (result.status === 'success') {
            setRegisterMessage({ text: "Inscription réussie ! Veuillez consulter vos emails pour vérifier votre compte avant de vous connecter.", type: 'success' });
            setRegisterForm({ prenom: '', nom: '', email: '', password: '', telephone: '', pieceIdentite: '', dateDeNaissance: '', referralCode: '' });
        } else {
             setRegisterMessage({ text: result.message || "Une erreur est survenue.", type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-koba-bg flex flex-col justify-center items-center p-4">
            <header className="text-center mb-8">
                <img src="/logo.png" alt="Kobarapide Logo" className="w-40 h-40 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-white">Bienvenue sur Kobarapide</h1>
                <p className="text-gray-300 mt-2">Votre plateforme d'entraide et de soutien communautaire.</p>
            </header>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Se Connecter">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <InputField name="email_login" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <InputField name="password_login" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />

                        {loginError && <p className="text-red-400 text-sm p-2 bg-red-900/50 rounded-md">{loginError}</p>}
                        <button type="submit" disabled={isUpdating} className="w-full bg-koba-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500">
                            {isUpdating ? 'Connexion...' : 'Se Connecter'}
                        </button>
                    </form>
                </Card>
                <Card title="S'inscrire">
                    <form onSubmit={handleRegister} className="space-y-3">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputField name="prenom" type="text" placeholder="Prénom" value={registerForm.prenom} onChange={handleRegisterChange} error={formErrors.prenom} />
                            <InputField name="nom" type="text" placeholder="Nom" value={registerForm.nom} onChange={handleRegisterChange} error={formErrors.nom} />
                        </div>
                        <InputField name="email" type="email" placeholder="Email" value={registerForm.email} onChange={handleRegisterChange} error={formErrors.email} />
                        <InputField name="password" type="password" placeholder="Mot de passe" value={registerForm.password} onChange={handleRegisterChange} error={formErrors.password} />
                        <InputField name="telephone" type="tel" placeholder="Téléphone" value={registerForm.telephone} onChange={handleRegisterChange} error={formErrors.telephone} />
                        <InputField name="pieceIdentite" type="text" placeholder="N° Pièce d'identité" value={registerForm.pieceIdentite} onChange={handleRegisterChange} error={formErrors.pieceIdentite} />
                        <InputField name="dateDeNaissance" type="date" placeholder="Date de naissance" value={registerForm.dateDeNaissance} onChange={handleRegisterChange} error={formErrors.dateDeNaissance} />
                        <InputField name="referralCode" type="text" placeholder="Code de parrainage (Optionnel)" value={registerForm.referralCode} onChange={handleRegisterChange} error={formErrors.referralCode} required={false}/>
                        
                        {registerMessage.text && <p className={`${registerMessage.type === 'success' ? 'text-green-300' : registerMessage.type === 'error' ? 'text-red-400' : 'text-yellow-300'} text-sm`}>{registerMessage.text}</p>}

                        <button type="submit" disabled={isUpdating} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500">
                             {isUpdating ? 'Inscription...' : "S'inscrire"}
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default HomePage;