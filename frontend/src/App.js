import React from 'react';
import './styles/App.css';
import AppRoutes from './routes';
import { AuthProvider } from './dataLogin';

function App() {
  return (
    <div>
      <AuthProvider>
        <div className="container-content">
          <AppRoutes />
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;