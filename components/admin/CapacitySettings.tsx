import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import { useAppContext } from '../../context/DataContext';

interface CapacitySettingsProps {
    showToast: (message: string) => void;
}

const CapacitySettings: React.FC<CapacitySettingsProps> = ({ showToast }) => {
    const { capacityConfig, updateCapacityConfig } = useAppContext();
    const [totalCapacity, setTotalCapacity] = useState(capacityConfig.totalCapacity);
    const [autoIncrease, setAutoIncrease] = useState(capacityConfig.autoIncrease);

    useEffect(() => {
        setTotalCapacity(capacityConfig.totalCapacity);
        setAutoIncrease(capacityConfig.autoIncrease);
    }, [capacityConfig]);

    const handleSave = () => {
        updateCapacityConfig({ totalCapacity: Number(totalCapacity), autoIncrease });
        showToast('Paramètres de capacité sauvegardés.');
    };

    return (
        <Card title="Paramètres de Capacité">
            <div className="space-y-4">
                <div>
                    <label htmlFor="total-capacity" className="block text-sm font-medium text-gray-300">Capacité totale de clients</label>
                    <input 
                        type="number" 
                        id="total-capacity" 
                        value={totalCapacity}
                        onChange={(e) => setTotalCapacity(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-koba-accent focus:ring-koba-accent sm:text-sm p-2" 
                    />
                </div>
                <div className="flex items-center">
                    <input 
                        id="auto-increase" 
                        type="checkbox" 
                        checked={autoIncrease}
                        onChange={(e) => setAutoIncrease(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-koba-accent focus:ring-koba-accent" 
                    />
                    <label htmlFor="auto-increase" className="ml-2 block text-sm text-gray-200">Augmentation automatique (+50 clients par mois)</label>
                </div>
                <div className="bg-blue-900/50 p-3 rounded-lg text-sm text-blue-200">
                    <p>Un buffer de réserve de 10% est automatiquement ajouté pour les cas particuliers.</p>
                </div>
                 <div className="flex justify-end">
                    <button onClick={handleSave} className="bg-koba-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded">
                        Sauvegarder
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default CapacitySettings;
