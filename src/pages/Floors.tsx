import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Floor } from '../types/floor';
import { floorService } from '../services/floorService';
import { useAuth } from '../contexts/AuthContext';
// Removed useData to rely solely on backend data

const Floors: React.FC = () => {
  const { user } = useAuth();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentFloor, setCurrentFloor] = useState<Partial<Floor>>({
    level: 0,
    name: '',
    description: '',
    totalApartments: 0
  });

  useEffect(() => {
    loadFloors();
  }, []);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const data = await floorService.getAll();
      setFloors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentFloor((prev: Partial<Floor>) => ({
      ...prev,
      [name]: name === 'level' || name === 'totalApartments' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentFloor.id) {
        await floorService.update(currentFloor.id, currentFloor);
      } else {
        await floorService.create(currentFloor as Omit<Floor, 'id'>);
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      loadFloors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save floor');
    }
  };

  const handleEdit = (floor: Floor) => {
    setCurrentFloor(floor);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this floor?')) {
      try {
        await floorService.delete(id);
        setFloors(floors.filter(floor => floor.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete floor');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Floors</h1>
        {user?.isAdmin && (
          <button
            onClick={() => {
              setCurrentFloor({
                level: 0,
                name: '',
                description: '',
                totalApartments: 0
              });
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add New Floor
          </button>
        )}
      </div>

      {/* Floors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map(floor => (
          <div key={floor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h2 className="text-xl font-semibold">Floor {floor.level}</h2>
              <p className="text-gray-600">{floor.name}</p>
              <p className="text-gray-600">Total Apartments: {floor.totalApartments}</p>
              <p className="text-gray-600 mt-2">{floor.description}</p>
              <div className="mt-4 flex justify-end space-x-2">
              {user?.isAdmin && (
                  <button
                    onClick={() => handleEdit(floor)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                )}
                <Link
                  to={`/admin/floors/${floor.id}/annotate`}
                  className="text-teal-600 hover:text-teal-800"
                >
                  Annotate
                </Link>
                {user?.isAdmin && (
                  <button
                    onClick={() => handleDelete(floor.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditModalOpen ? 'Edit Floor' : 'Add New Floor'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <input
                  type="number"
                  name="level"
                  value={currentFloor.level}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={currentFloor.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={currentFloor.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Apartments</label>
                <input
                  type="number"
                  name="totalApartments"
                  value={currentFloor.totalApartments}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {isEditModalOpen ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Floors;