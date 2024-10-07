import React from 'react';
import './styles/App.css';
import AppRoutes from './routes';
import CustomNavbar from './components/Navbar';

function App() {
  return (
    <div>
      <CustomNavbar />
      <div className="container-content">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;