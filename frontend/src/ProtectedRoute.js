import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, rolesAllowed, accessDeniedPath }) => {
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')); // Obtener usuario

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (rolesAllowed && !rolesAllowed.includes(user.role)) {
    return <Navigate to={accessDeniedPath || "/accessDenied"} replace />;
  }

  return element;
};

export default ProtectedRoute;