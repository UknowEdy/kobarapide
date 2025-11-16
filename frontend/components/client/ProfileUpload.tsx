import React, { useState } from 'react';
import ImageUpload from '../shared/ImageUpload';

interface ProfileUploadProps {
  user: any;
  darkMode?: boolean;
  onClose?: () => void;
}

const ProfileUpload: React.FC<ProfileUploadProps> = ({ user, darkMode = true, onClose }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'https://kobarapide.onrender.com';

  const handleIdCardUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('idCard', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/upload/id-card`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || ''
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Photo de la carte d\'identité téléchargée avec succès!');
        return { success: true, photoUrl: data.photoUrl };
      } else {
        return { success: false, message: data.msg || 'Erreur lors du téléchargement' };
      }
    } catch (error: any) {
      console.error('Error uploading ID card:', error);
      return { success: false, message: error.message || 'Erreur serveur' };
    }
  };

  const handleSelfieUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('selfie', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/upload/selfie`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || ''
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Selfie avec pièce d\'identité téléchargé avec succès!');
        return { success: true, photoUrl: data.selfieIdUrl };
      } else {
        return { success: false, message: data.msg || 'Erreur lors du téléchargement' };
      }
    } catch (error: any) {
      console.error('Error uploading selfie:', error);
      return { success: false, message: error.message || 'Erreur serveur' };
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-6`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Documents d'Identité</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Téléchargez vos documents pour compléter votre profil
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded font-bold`}
            >
              Retour
            </button>
          )}
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID Card Upload */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              📄 Carte d'Identité
              {user?.photoUrl && <span className="text-green-500 text-sm">✓ Téléchargée</span>}
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Photo claire de votre carte d'identité (recto)
            </p>
            <ImageUpload
              label="Photo de la Carte d'Identité"
              currentImageUrl={user?.photoUrl ? `${API_URL}${user.photoUrl}` : undefined}
              onUpload={handleIdCardUpload}
              darkMode={darkMode}
            />
            <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'} text-xs`}>
              ℹ️ Cette photo est conservée de manière permanente pour votre dossier
            </div>
          </div>

          {/* Selfie Upload */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🤳 Selfie avec Pièce d'Identité
              {user?.selfieIdUrl && <span className="text-green-500 text-sm">✓ Téléchargée</span>}
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Photo de vous tenant votre carte d'identité à côté de votre visage
            </p>
            <ImageUpload
              label="Selfie avec Pièce d'Identité"
              currentImageUrl={user?.selfieIdUrl ? `${API_URL}${user.selfieIdUrl}` : undefined}
              onUpload={handleSelfieUpload}
              darkMode={darkMode}
            />
            <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'} text-xs`}>
              ⚠️ Cette photo est conservée pendant 30 jours puis automatiquement supprimée
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <h3 className="text-lg font-bold mb-3">📝 Instructions</h3>
          <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>✓ Les photos doivent être claires et lisibles</li>
            <li>✓ Format accepté: JPG, PNG, GIF</li>
            <li>✓ Taille maximale: 5 MB par fichier</li>
            <li>✓ Votre visage et les informations de la carte doivent être visibles</li>
            <li>✓ Évitez les reflets et les zones floues</li>
          </ul>
        </div>

        {/* Current Status */}
        <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <h3 className="text-lg font-bold mb-3">📊 Statut de Votre Profil</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm text-gray-400 mb-1">Carte d'Identité</p>
              <p className={`font-bold ${user?.photoUrl ? 'text-green-500' : 'text-red-500'}`}>
                {user?.photoUrl ? '✓ Téléchargée' : '✗ Manquante'}
              </p>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm text-gray-400 mb-1">Selfie avec ID</p>
              <p className={`font-bold ${user?.selfieIdUrl ? 'text-green-500' : 'text-red-500'}`}>
                {user?.selfieIdUrl ? '✓ Téléchargée' : '✗ Manquante'}
              </p>
            </div>
            <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm text-gray-400 mb-1">Statut Compte</p>
              <p className={`font-bold ${
                user?.status === 'ACTIF' ? 'text-green-500' :
                user?.status === 'EN_ATTENTE' ? 'text-yellow-500' :
                'text-red-500'
              }`}>
                {user?.status || 'EN_ATTENTE'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpload;
