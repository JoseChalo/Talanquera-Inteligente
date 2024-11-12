import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Verifica si el usuario está autenticado y tiene el rol necesario
  if (!user || (allowedRoles && user.role !== allowedRoles)) {
    console.log('rediorigir a login');
    return <Navigate to="/accessDenied" />;
  }

  return element;
};

export default ProtectedRoute;
