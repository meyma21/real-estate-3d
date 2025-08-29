import React, { useState } from 'react';
import { PlusCircle, Edit, Trash, Box as Box3d } from 'lucide-react';
import { useData, ThreeDPlan, Floor } from '../contexts/DataContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ThreeDPlans: React.FC = () => {
  const { threeDPlans, floors, loading, addThreeDPlan, updateThreeDPlan, deleteThreeDPlan } = useData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [newPlan, setNewPlan] = useState<Omit<ThreeDPlan, 'id'>>({
    name: '',
    floorId: '',
    modelUrl: ''
  });
  
  const [editPlan, setEditPlan] = useState<ThreeDPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<ThreeDPlan | null>(null);
  
  // Handle input changes for new plan
  const handleNewPlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setNewPlan({
      ...newPlan,
      [name]: value
    });
  };
  
  // Handle input changes for edit plan
  const handleEditPlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editPlan) return;
    
    const { name, value } = e.target;
    
    setEditPlan({
      ...editPlan,
      [name]: value
    });
  };
  
  // Handle adding a new 3D plan
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addThreeDPlan(newPlan);
      setIsAddModalOpen(false);
      setNewPlan({ name: '', floorId: '', modelUrl: '' });
      toast.success('3D plan added successfully');
    } catch (error) {
      toast.error('Failed to add 3D plan');
    }
  };
  
  // Handle updating a 3D plan
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editPlan) return;
    
    try {
      await updateThreeDPlan(editPlan.id, editPlan);
      setIsEditModalOpen(false);
      toast.success('3D plan updated successfully');
    } catch (error) {
      toast.error('Failed to update 3D plan');
    }
  };
  
  // Handle deleting a 3D plan
  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      await deleteThreeDPlan(planToDelete.id);
      setIsDeleteModalOpen(false);
      toast.success('3D plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete 3D plan');
    }
  };
  
  // Open edit modal
  const openEditModal = (plan: ThreeDPlan) => {
    setEditPlan(plan);
    setIsEditModalOpen(true);
  };
  
  // Open delete modal
  const openDeleteModal = (plan: ThreeDPlan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };
  
  // Get floor name by ID
  const getFloorName = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    return floor ? floor.name : 'Unknown Floor';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">3D Plans</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add New 3D Plan
        </button>
      </div>
      
      {/* 3D Plans list */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : threeDPlans.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No 3D plans found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Floor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Model URL</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {threeDPlans.map((plan) => (
                  <tr key={plan.id} className="table-row border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-700">{plan.name}</td>
                    <td className="px-4 py-3 text-slate-700">{getFloorName(plan.floorId)}</td>
                    <td className="px-4 py-3 text-slate-700 truncate max-w-xs">
                      <a 
                        href={plan.modelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        {plan.modelUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(plan)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Add 3D Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New 3D Plan"
      >
        <form onSubmit={handleAddPlan}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Plan Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="input"
                placeholder="e.g., Ground Floor 3D Model"
                value={newPlan.name}
                onChange={handleNewPlanChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="floorId" className="label">Floor *</label>
              <select
                id="floorId"
                name="floorId"
                className="select"
                value={newPlan.floorId}
                onChange={handleNewPlanChange}
                required
              >
                <option value="">Select Floor</option>
                {floors.map((floor: Floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="modelUrl" className="label">Model URL *</label>
              <div className="flex items-center gap-2">
                <input
                  id="modelUrl"
                  name="modelUrl"
                  type="text"
                  className="input"
                  placeholder="https://example.com/model.glb"
                  value={newPlan.modelUrl}
                  onChange={handleNewPlanChange}
                  required
                />
                <div className="flex-shrink-0 p-2 bg-teal-100 rounded-md">
                  <Box3d size={20} className="text-teal-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enter the URL to a GLB or GLTF 3D model file
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Add 3D Plan'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Edit 3D Plan Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit 3D Plan"
      >
        {editPlan && (
          <form onSubmit={handleUpdatePlan}>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="label">Plan Name *</label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  className="input"
                  value={editPlan.name}
                  onChange={handleEditPlanChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit-floorId" className="label">Floor *</label>
                <select
                  id="edit-floorId"
                  name="floorId"
                  className="select"
                  value={editPlan.floorId}
                  onChange={handleEditPlanChange}
                  required
                >
                  {floors.map((floor: Floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-modelUrl" className="label">Model URL *</label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-modelUrl"
                    name="modelUrl"
                    type="text"
                    className="input"
                    value={editPlan.modelUrl}
                    onChange={handleEditPlanChange}
                    required
                  />
                  <div className="flex-shrink-0 p-2 bg-teal-100 rounded-md">
                    <Box3d size={20} className="text-teal-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Update 3D Plan'}
              </button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to delete 3D plan <strong>{planToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeletePlan}
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ThreeDPlans;