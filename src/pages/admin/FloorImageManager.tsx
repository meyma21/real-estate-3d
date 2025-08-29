import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Download,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  FolderOpen,
  Plus,
  MoreVertical
} from 'lucide-react';
import { FloorImageInfo } from '../../types/floorImage';
import { floorImageService } from '../../services/floorImageService';
import Modal from '../../components/common/Modal';

interface FloorImageManagerProps {
  floorId: string;
  floorName: string;
  onClose: () => void;
}

const FloorImageManager: React.FC<FloorImageManagerProps> = ({ floorId, floorName, onClose }) => {
  const [images, setImages] = useState<FloorImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FloorImageInfo | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  useEffect(() => {
    loadImages();
  }, [floorId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const imageData = await floorImageService.getFloorImageDetails(floorId);
      setImages(imageData);
    } catch (error) {
      console.error('Failed to load images:', error);
      addNotification('error', 'Failed to load floor images');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      setUploadLoading(true);
      
      // Validate files
      const validFiles = files.filter(file => floorImageService.isValidImageFile(file));
      if (validFiles.length !== files.length) {
        addNotification('error', 'Some files are not valid images and were skipped');
      }
      
      if (validFiles.length === 0) {
        addNotification('error', 'No valid image files selected');
        return;
      }

      if (validFiles.length === 1) {
        const result = await floorImageService.uploadFloorImage(floorId, validFiles[0]);
        if (result.success) {
          addNotification('success', `Image "${validFiles[0].name}" uploaded successfully`);
          await loadImages();
        } else {
          addNotification('error', result.error || 'Failed to upload image');
        }
      } else {
        const result = await floorImageService.uploadMultipleFloorImages(floorId, validFiles);
        if (result.success && result.errors?.length === 0) {
          addNotification('success', `${result.uploadedCount} images uploaded successfully`);
        } else if (result.uploadedCount > 0) {
          addNotification('info', `${result.uploadedCount}/${result.totalCount} images uploaded successfully`);
          if (result.errors) {
            result.errors.forEach(error => addNotification('error', error));
          }
        } else {
          addNotification('error', 'Failed to upload images');
        }
        await loadImages();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      addNotification('error', 'Failed to upload images');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteImage = async (image: FloorImageInfo) => {
    if (!window.confirm(`Are you sure you want to delete "${image.name}"?`)) {
      return;
    }

    try {
      const result = await floorImageService.deleteFloorImage(floorId, image.name);
      if (result.success) {
        addNotification('success', 'Image deleted successfully');
        await loadImages();
      } else {
        addNotification('error', result.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      addNotification('error', 'Failed to delete image');
    }
  };

  const handleRenameImage = async () => {
    if (!selectedImage || !newFileName.trim()) {
      return;
    }

    if (!floorImageService.isValidFileName(newFileName)) {
      addNotification('error', 'Invalid file name');
      return;
    }

    try {
      const result = await floorImageService.renameFloorImage(floorId, selectedImage.name, newFileName);
      if (result.success) {
        addNotification('success', 'Image renamed successfully');
        await loadImages();
        setIsRenameModalOpen(false);
        setSelectedImage(null);
        setNewFileName('');
      } else {
        addNotification('error', result.message || 'Failed to rename image');
      }
    } catch (error) {
      console.error('Rename failed:', error);
      addNotification('error', 'Failed to rename image');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Floor Images</h2>
              <p className="text-gray-600">{floorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6 border-b border-gray-200">
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              dragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              {uploadLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                  <p className="text-lg font-medium text-gray-900">Uploading images...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drag & drop images here, or click to select
                    </p>
                    <p className="text-gray-600">
                      Supports JPG, PNG, WebP, GIF, BMP files
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleFileUpload(files);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Select Images
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              <span className="ml-3 text-lg text-gray-600">Loading images...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">No images found</h3>
              <p className="text-gray-400">Upload some images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {images.map((image) => (
                  <motion.div
                    key={image.name}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={image.downloadUrl}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedImage(image);
                              setIsViewerOpen(true);
                            }}
                            className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedImage(image);
                              setNewFileName(image.name);
                              setIsRenameModalOpen(true);
                            }}
                            className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                            title="Rename"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(image)}
                            className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate" title={image.name}>
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {floorImageService.formatFileSize(image.size)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Image Viewer Modal */}
      {isViewerOpen && selectedImage && (
        <Modal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          title={selectedImage.name}
          size="full"
        >
          <div className="flex items-center justify-center h-full">
            <img
              src={selectedImage.downloadUrl}
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </Modal>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && selectedImage && (
        <Modal
          isOpen={isRenameModalOpen}
          onClose={() => {
            setIsRenameModalOpen(false);
            setSelectedImage(null);
            setNewFileName('');
          }}
          title="Rename Image"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current name: {selectedImage.name}
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter new file name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setSelectedImage(null);
                  setNewFileName('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameImage}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                disabled={!newFileName.trim() || newFileName === selectedImage.name}
              >
                Rename
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-md ${
                notification.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
              <p className="text-sm font-medium flex-1">{notification.message}</p>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloorImageManager;
