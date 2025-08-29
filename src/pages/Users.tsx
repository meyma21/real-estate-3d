import React, { useState } from 'react';
import { PlusCircle, Edit, Trash, User, ShieldCheck, Shield } from 'lucide-react';
import { useAuth, User as UserType, UserRole } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Mock user data since we don't have a real backend
const mockUsers: UserType[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    role: 'USER'
  },
  {
    id: '3',
    username: 'sarah',
    email: 'sarah@example.com',
    role: 'USER'
  },
  {
    id: '4',
    username: 'david',
    email: 'david@example.com',
    role: 'ADMIN'
  }
];

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users] = useState<UserType[]>(mockUsers);
  const [loading, setLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER' as UserRole
  });
  
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  
  // Handle input changes for new user
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setNewUser({
      ...newUser,
      [name]: value
    });
  };
  
  // Handle input changes for edit user
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editUser) return;
    
    const { name, value } = e.target;
    
    setEditUser({
      ...editUser,
      [name]: value
    });
  };
  
  // Handle adding a new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAddModalOpen(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'USER'
      });
      setLoading(false);
      toast.success('User added successfully');
    }, 1000);
  };
  
  // Handle updating a user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsEditModalOpen(false);
      setLoading(false);
      toast.success('User updated successfully');
    }, 1000);
  };
  
  // Handle deleting a user
  const handleDeleteUser = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsDeleteModalOpen(false);
      setLoading(false);
      toast.success('User deleted successfully');
    }, 1000);
  };
  
  // Open edit modal
  const openEditModal = (user: UserType) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };
  
  // Open delete modal
  const openDeleteModal = (user: UserType) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add New User
        </button>
      </div>
      
      {/* Users list */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Username</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="table-row border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                          <User size={16} className="text-slate-600" />
                        </div>
                        {user.username}
                        {user.id === currentUser?.id && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {user.role === 'ADMIN' ? (
                          <>
                            <ShieldCheck size={16} className="text-blue-600 mr-1.5" />
                            <span className="text-blue-600 font-medium">Admin</span>
                          </>
                        ) : (
                          <>
                            <Shield size={16} className="text-slate-600 mr-1.5" />
                            <span className="text-slate-600">User</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        disabled={user.id === currentUser?.id}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        disabled={user.id === currentUser?.id}
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
      
      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUser}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="label">Username *</label>
              <input
                id="username"
                name="username"
                type="text"
                className="input"
                value={newUser.username}
                onChange={handleNewUserChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="label">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                value={newUser.email}
                onChange={handleNewUserChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                value={newUser.password}
                onChange={handleNewUserChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="role" className="label">Role *</label>
              <select
                id="role"
                name="role"
                className="select"
                value={newUser.role}
                onChange={handleNewUserChange}
                required
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
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
              {loading ? <LoadingSpinner size="sm" /> : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        {editUser && (
          <form onSubmit={handleUpdateUser}>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-username" className="label">Username *</label>
                <input
                  id="edit-username"
                  name="username"
                  type="text"
                  className="input"
                  value={editUser.username}
                  onChange={handleEditUserChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit-email" className="label">Email *</label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  className="input"
                  value={editUser.email}
                  onChange={handleEditUserChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="edit-role" className="label">Role *</label>
                <select
                  id="edit-role"
                  name="role"
                  className="select"
                  value={editUser.role}
                  onChange={handleEditUserChange}
                  required
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="new-password" className="label">New Password</label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Leave blank to keep current password"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave blank to keep the current password
                </p>
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
                {loading ? <LoadingSpinner size="sm" /> : 'Update User'}
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
            Are you sure you want to delete user <strong>{userToDelete?.username}</strong>?
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
              onClick={handleDeleteUser}
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

export default Users;