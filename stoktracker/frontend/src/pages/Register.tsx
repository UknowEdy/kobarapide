import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Package } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pin: '',
    confirmPin: '',
    businessName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.pin !== formData.confirmPin) {
      setError('Les codes PIN ne correspondent pas');
      return;
    }

    if (formData.pin.length < 4) {
      setError('Le PIN doit contenir au moins 4 chiffres');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: formData.name,
        phone: formData.phone,
        pin: formData.pin,
        businessName: formData.businessName || undefined
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Échec de l\'inscription');
      }
    } catch (err: any) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Package className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StokTracker</h1>
          <p className="text-primary-100">Créez votre compte gratuitement</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inscription</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom complet"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Votre nom"
              required
              fullWidth
            />

            <Input
              label="Numéro de téléphone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+228 XX XX XX XX"
              required
              fullWidth
            />

            <Input
              label="Nom de votre commerce (optionnel)"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Ex: Boutique Amina"
              fullWidth
            />

            <Input
              label="Code PIN (4-6 chiffres)"
              name="pin"
              type="password"
              value={formData.pin}
              onChange={handleChange}
              placeholder="Créez un PIN"
              maxLength={6}
              required
              fullWidth
            />

            <Input
              label="Confirmer le PIN"
              name="confirmPin"
              type="password"
              value={formData.confirmPin}
              onChange={handleChange}
              placeholder="Confirmez votre PIN"
              maxLength={6}
              required
              fullWidth
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-6"
            >
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
