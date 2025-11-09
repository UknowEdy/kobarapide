import React, { useState } from 'react';
import { User } from '../../types';

interface PhotoHistoryModalProps {
    user: User;
    onClose: () => void;
}

const PhotoHistoryModal: React.FC<PhotoHistoryModalProps> = ({ user, onClose }) => {
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

    const PhotoThumbnail: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => (
        <div className="w-full">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">{alt}</h4>
            {src ? (
                <img 
                    src={src} 
                    alt={alt}
                    className="w-full h-48 object-cover rounded-md cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setZoomedImageUrl(src)}
                />
            ) : (
                <div className="w-full h-48 bg-gray-700/50 rounded-md flex items-center justify-center">
                    <p className="text-gray-400 text-xs">Non disponible</p>
                </div>
            )}
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50" onClick={onClose}>
                <div className="bg-koba-card rounded-lg shadow-xl p-6 w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Historique Photos de {user.prenom} {user.nom}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PhotoThumbnail src={user.photoUrl} alt="Photo de Profil" />
                        <PhotoThumbnail src={user.selfieIdUrl} alt="Selfie avec Pièce d'Identité" />
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Fermer</button>
                    </div>
                </div>
            </div>

            {zoomedImageUrl && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-60"
                    onClick={() => setZoomedImageUrl(null)}
                >
                    <img src={zoomedImageUrl} alt="Zoomed view" className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </>
    );
};

export default PhotoHistoryModal;