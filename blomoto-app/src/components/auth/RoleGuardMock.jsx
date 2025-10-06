import React from 'react';
import { useAuth } from '../../context/AuthContext';

function RoleGuardMock({ roles = [], children }) {
  const { user } = useAuth();
  if (!roles.length) return children;
  if (!user || !roles.includes(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Accès restreint (mock): réservé à {roles.join(', ')}.
        </div>
      </div>
    );
  }
  return children;
}

export default RoleGuardMock;


