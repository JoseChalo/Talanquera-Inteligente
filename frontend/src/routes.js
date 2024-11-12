import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Residents from './components/Residents';
import Visits from './components/Visits';
import Cars from './components/Cars';
import RegisterResident from './components/RegisterResident';
import RegisterVisits from './components/RegisterVisits';
import RegisterCars from './components/RegisterCars';
import CameraCapture from './pages/accessCamera';
import EditResident from './components/EditResident';
import EditCars from './components/EditCars';
import EditVisit from './components/EditVisit';
import Login from './components/Login';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from './dataLogin';
import { AuthProvider } from './dataLogin';

function AppRoutes() {
  const { user } = useAuth();
  console.log(user);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route
            path="/residents"
            element={<ProtectedRoute element={<Residents />} rolesAllowed={['admin']} />}
          />
          <Route
            path="/visits"
            element={<ProtectedRoute element={<Visits />} rolesAllowed={['admin', 'residente']} />}
          />
          <Route
            path="/cars"
            element={<ProtectedRoute element={<Cars />} rolesAllowed={['admin']} />}
          />
          <Route
            path="/RegisterResident"
            element={<ProtectedRoute element={<RegisterResident />} rolesAllowed={['admin']} />}
          />
          <Route
            path="/RegisterVisits"
            element={<ProtectedRoute element={<RegisterVisits />} rolesAllowed={['admin', 'residente']} />}
          />
          <Route
            path="/RegisterCars"
            element={<ProtectedRoute element={<RegisterCars />} rolesAllowed={['admin']} />}
          />
          <Route
            path="/camara"
            element={<ProtectedRoute element={<CameraCapture />} rolesAllowed={['admin', 'garita']} />}
          />
          <Route
            path="/EditResident"
            element={<ProtectedRoute element={<EditResident />} rolesAllowed={['admin']} />}
          />
          <Route
            path="/EditCars"
            element={<ProtectedRoute element={<EditCars />} rolesAllowed={['admin']} />}
          />
          <Route
            path="/EditVisit"
            element={<ProtectedRoute element={<EditVisit />} rolesAllowed={['admin', 'residente']} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default AppRoutes;
