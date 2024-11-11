import React from 'react';
import { Navigate } from 'react-router-dom';

// Componente de Ruta Protegida
const ProtectedRoute = ({ element, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Verifica si el usuario está autenticado y tiene el rol necesario
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
