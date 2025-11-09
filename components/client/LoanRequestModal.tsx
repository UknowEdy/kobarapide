import React, { useState } from 'react';
import { useAppContext } from '../../context/DataContext';
import { User } from '../../types';

interface LoanRequestModalProps {
    user: User;
    maxLoanAmount: number;
    onClose: () => void;
    showToast: (message: string) => void;
}

const LoanRequestModal: React.FC<LoanRequestModalProps> = ({ user, maxLoanAmount, onClose, showToast }) => {
    const { createLoanApplication, isUpdating } = useAppContext();
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [error, setError] = useState('');

    const availableAmounts = [5000, 10000, 15000, 20000].filter(a => a <= maxLoanAmount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!amount || !purpose) {
            setError("Veuillez remplir tous les champs.");
            return;
        }
        if (Number(amount) <= 0) {
             setError("Veuillez sélectionner un montant valide.");
            return;
        }

        const result = await createLoanApplication({
            amount: Number(amount),
            purpose,
            userId: user._id,
        });

        if (result.success) {
            showToast(result.message);
            onClose();
        } else {
            setError(result.message || "Une erreur est survenue.");
        }
    };

    return (
        <div className="fixed inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-koba-card rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Faire une demande de prêt</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Montant (F)</label>
                        <select
                            id="amount"
                            name="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-koba-accent focus:ring-koba-accent sm:text-sm p-2"
                        >
                            <option value="">-- Choisissez un montant --</option>
                            {availableAmounts.map(a => (
                                <option key={a} value={a}>{a.toLocaleString()}F</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-300">Motif du prêt</label>
                        <input
                            id="purpose"
                            name="purpose"
                            type="text"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-koba-accent"
                            placeholder="Ex: Achat de matériel"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                        <button type="submit" disabled={isUpdating || availableAmounts.length === 0} className="px-4 py-2 text-sm rounded bg-koba-accent hover:bg-opacity-90 disabled:bg-gray-500">
                            {isUpdating ? 'Envoi...' : 'Envoyer la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanRequestModal;