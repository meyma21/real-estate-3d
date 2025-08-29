import React, { useState, useEffect } from 'react';
import { makeUserAdmin, isUserAdmin } from '../../utils/adminUtils';
import { getAuth } from 'firebase/auth';

const AdminTest: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const adminStatus = await isUserAdmin();
    setIsAdmin(adminStatus);
  };

  const handleMakeAdmin = async () => {
    try {
      setMessage('Setting admin role...');
      await makeUserAdmin(userId);
      setMessage('Admin role set successfully!');
      // Refresh admin status
      await checkAdminStatus();
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Test Panel</h2>
      
      <div className="mb-4">
        <p>Current Admin Status: {isAdmin ? '✅ Admin' : '❌ Not Admin'}</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID to make admin"
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={handleMakeAdmin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Make Admin
        </button>
      </div>

      {message && (
        <div className={`p-2 rounded ${message.includes('Error') ? 'bg-red-100' : 'bg-green-100'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminTest; 