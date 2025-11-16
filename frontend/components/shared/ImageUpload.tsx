import React, { useState } from 'react';

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<{ success: boolean; photoUrl?: string; message?: string }>;
  accept?: string;
  maxSizeMB?: number;
  darkMode?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  currentImageUrl,
  onUpload,
  accept = 'image/*',
  maxSizeMB = 5,
  darkMode = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont autorisées');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const result = await onUpload(file);

      if (result.success) {
        // Success handled by parent component
      } else {
        setError(result.message || 'Erreur lors du téléchargement');
        setPreview(currentImageUrl || null);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléchargement');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold">{label}</label>

      {/* Preview */}
      {preview && (
        <div className={`relative ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-4`}>
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-64 mx-auto rounded"
          />
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <label
          className={`flex-1 cursor-pointer ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-3 rounded font-bold text-center transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? '⏳ Téléchargement...' : preview ? '🔄 Changer l\'image' : '📷 Choisir une image'}
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 text-red-200 px-4 py-2 rounded text-sm">
          ❌ {error}
        </div>
      )}

      {/* File Info */}
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Formats acceptés: JPG, PNG, GIF • Taille max: {maxSizeMB}MB
      </p>
    </div>
  );
};

export default ImageUpload;
