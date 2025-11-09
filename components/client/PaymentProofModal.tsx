import React, { useState } from 'react';
import { useAppContext } from '../../context/DataContext';
import { Installment } from '../../types';

interface PaymentProofModalProps {
    loanId: string;
    installment: Installment;
    onClose: () => void;
    showToast: (message: string) => void;
}

const PAYMENT_PHONE_NUMBER = "07 01 02 03 04"; // Mettez ici le numéro de transfert

const PaymentProofModal: React.FC<PaymentProofModalProps> = ({ loanId, installment, onClose, showToast }) => {
    const { submitPaymentProof, isUpdating } = useAppContext();
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!proofFile) {
            setError("Veuillez téléverser une preuve de paiement.");
            return;
        }

        const result = await submitPaymentProof(loanId, installment.installmentNumber, proofFile);
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
                    <h2 className="text-xl font-bold text-white">Soumettre la Preuve de Paiement</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="bg-koba-bg p-4 rounded-lg mb-4 text-center">
                    <p className="text-gray-300">Veuillez effectuer un transfert de <strong className="text-koba-accent">{installment.dueAmount.toLocaleString()}F</strong> au numéro suivant :</p>
                    <p className="text-2xl font-bold text-white my-2 tracking-widest">{PAYMENT_PHONE_NUMBER}</p>
                    <p className="text-sm text-gray-400">Ensuite, téléversez une capture d'écran ou une photo de la transaction comme preuve.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="proof-upload" className="block text-sm font-medium text-gray-300">Preuve de paiement</label>
                        <input
                            id="proof-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-koba-accent file:text-white hover:file:bg-opacity-90"
                        />
                    </div>
                    {preview && <img src={preview} alt="Aperçu" className="max-h-40 rounded-lg mx-auto" />}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                        <button type="submit" disabled={isUpdating || !proofFile} className="px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-500">
                            {isUpdating ? 'Envoi...' : 'Je confirme avoir payé'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentProofModal;
