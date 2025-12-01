import { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  maxImages?: number;
  folder?: 'garages' | 'vehicles' | 'avatars';
  multiple?: boolean;
  label?: string;
  initialUrls?: string[];
}

export default function ImageUpload({
  onUploadComplete,
  maxImages = 1,
  folder = 'garages',
  multiple = false,
  label = 'Télécharger des images',
  initialUrls = [],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialUrls);

  // Synchroniser avec les URLs initiales
  useEffect(() => {
    if (initialUrls && initialUrls.length > 0) {
      setUploadedUrls(initialUrls);
    }
  }, [initialUrls]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limiter le nombre de fichiers
    const filesToUpload = files.slice(0, maxImages - uploadedUrls.length);
    
    // Créer des previews
    const previewPromises = filesToUpload.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            resolve('');
          }
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    });

    // Attendre que toutes les previews soient créées
    const previewResults = await Promise.all(previewPromises);
    setPreviews((prev) => [...prev, ...previewResults.filter(p => p)]);

    setUploading(true);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append(multiple ? 'images' : 'avatar', file);
      });
      formData.append('folder', folder);

      const endpoint = folder === 'avatars' ? '/upload/avatar' : folder === 'garages' ? '/upload/garage' : '/upload/vehicle';
      
      const res = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const urls = folder === 'avatars' 
        ? [res.data.avatar] 
        : folder === 'garages' 
        ? res.data.images 
        : res.data.photos;

      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);
      // Nettoyer les previews après upload réussi
      setPreviews([]);
      onUploadComplete(newUrls);

      // Réinitialiser l'input
      e.target.value = '';
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du téléchargement');
      // Retirer les previews en cas d'erreur
      setPreviews((prev) => prev.slice(0, -filesToUpload.length));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number, isPreview: boolean = false) => {
    if (isPreview) {
      const newPreviews = previews.filter((_, i) => i !== index);
      setPreviews(newPreviews);
    } else {
      const newUrls = uploadedUrls.filter((_, i) => i !== index);
      setUploadedUrls(newUrls);
      onUploadComplete(newUrls);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-noir-700)' }}>
        {label}
      </label>

      {/* Prévisualisations */}
      {(previews.length > 0 || uploadedUrls.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-full h-32 object-cover rounded-lg border-2"
                style={{ borderColor: 'var(--color-racine-200)' }}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">Upload...</div>
                </div>
              )}
              <button
                onClick={() => removeImage(index, true)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {uploadedUrls.map((url, index) => (
            <div key={`uploaded-${index}`} className="relative group">
              <img
                src={url}
                alt={`Uploaded ${index}`}
                className="w-full h-32 object-cover rounded-lg border-2"
                style={{ borderColor: 'var(--color-racine-200)' }}
              />
              <button
                onClick={() => removeImage(index, false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div>
        <input
          type="file"
          accept="image/*"
          multiple={multiple && uploadedUrls.length < maxImages}
          onChange={handleFileSelect}
          disabled={uploading || uploadedUrls.length >= maxImages}
          className="hidden"
          id="image-upload-input"
        />
        <label
          htmlFor="image-upload-input"
          className={`inline-block px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            uploading || uploadedUrls.length >= maxImages
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          style={{ backgroundColor: 'var(--color-rouge-600)', color: 'white' }}
        >
          {uploading ? 'Téléchargement...' : `+ ${multiple ? 'Ajouter des images' : 'Ajouter une image'}`}
        </label>
        {maxImages > 1 && (
          <p className="text-xs mt-2" style={{ color: 'var(--color-noir-600)' }}>
            {uploadedUrls.length} / {maxImages} images
          </p>
        )}
      </div>
    </div>
  );
}

