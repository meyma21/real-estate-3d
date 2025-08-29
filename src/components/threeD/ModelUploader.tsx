import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadModel, validateModelFile } from '../../utils/modelUpload';
import { threeDService } from '../../services/threeDService';

interface ModelUploaderProps {
  floorId: string;
  onUploadComplete: (modelUrl: string) => void;
}

const ModelUploader: React.FC<ModelUploaderProps> = ({ floorId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateModelFile(file)) {
      setError('Invalid file. Please select a GLTF model under 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setError(null);

      // Upload model to Firebase Storage
      const modelUrl = await uploadModel(selectedFile, floorId);

      // Create or update 3D plan in Firestore
      const plan = await threeDService.getByFloorId(floorId);
      if (plan) {
        await threeDService.update(plan.id, { modelUrl });
      } else {
        await threeDService.create({
          floorId,
          modelUrl,
          buttons: []
        });
      }

      onUploadComplete(modelUrl);
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload model');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Upload 3D Model</h3>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileSelect}
            className="hidden"
            id="model-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="model-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {selectedFile ? selectedFile.name : 'Click to select a GLTF model'}
            </span>
          </label>
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Model'}
        </button>
      </div>
    </div>
  );
};

export default ModelUploader; 