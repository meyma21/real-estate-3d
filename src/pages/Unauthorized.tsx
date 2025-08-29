import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert size={32} className="text-red-600" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
          Access Denied
        </h2>
        <p className="text-slate-600 mb-8">
          You don't have permission to access this page. Please contact an administrator if you believe this is a mistake.
        </p>
        <div className="space-y-4">
          <Link
            to="/admin/dashboard"
            className="btn btn-primary w-full"
          >
            Return to Dashboard
          </Link>
          <Link
            to="/login"
            className="btn btn-outline w-full"
          >
            Sign in as Different User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 