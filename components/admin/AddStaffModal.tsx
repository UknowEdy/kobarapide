import React, { useState } from 'react';
import { useAppContext } from '../../context/DataContext';
import { Role } from '../../types';

interface AddStaffModalProps {
    onClose: () => void;
    showToast: (message: string) => void;
}

const AddStaffModal: React.FC<AddStaffModalProps> = ({ onClose, showToast }) => {
    const { addStaffMember, isUpdating } = useAppContext();
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        role: Role.MODERATEUR,
        password: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.prenom || !formData.nom || !formData.email || !formData.password) {
            setError("Tous les champs sont requis.");
            return;
        }
         if (formData.password.length < 6) {
            setError("Le mot de passe doit faire au moins 6 caractères.");
            return;
        }

        // A type guard is used to ensure the role is either ADMIN or MODERATEUR.
        if (formData.role !== Role.ADMIN && formData.role !== Role.MODERATEUR) {
            setError("Un rôle valide doit être sélectionné.");
            return;
        }

        // FIX: The type guard narrows `formData.role`, but not the `formData` object itself.
        // We create a new object with the correctly narrowed role type to satisfy `addStaffMember`.
        const result = await addStaffMember({
            prenom: formData.prenom,
            nom: formData.nom,
            email: formData.email,
            role: formData.role,
            password: formData.password,
        });
        if (result.success) {
            showToast(result.message);
            onClose();
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-koba-bg bg-opacity-80 flex justify-center items-center z-50">
            <div className="bg-koba-card rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Ajouter un Membre du Staff</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} />
                    <InputField name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} />
                    <InputField name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                    <InputField name="password" type="password" placeholder="Mot de passe temporaire" value={formData.password} onChange={handleChange} />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300">Rôle</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-koba-accent focus:ring-koba-accent sm:text-sm p-2"
                        >
                            <option value={Role.MODERATEUR}>Modérateur</option>
                            <option value={Role.ADMIN}>Administrateur</option>
                        </select>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500">Annuler</button>
                        <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm rounded bg-koba-accent hover:bg-opacity-90 disabled:bg-gray-500">
                            {isUpdating ? 'Ajout...' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{name: string; type?: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;}> = ({ name, type = 'text', placeholder, value, onChange }) => (
    <div>
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <input
            id={name}
            name={name}
            type={type}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-koba-accent"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);

export default AddStaffModal;