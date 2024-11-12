import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AccessDenied from './pages/accessDenied'
import RekognitionConfig from './RekognitionConfig';
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
import Houses from './components/Houses';
import RegisterHouses from './components/RegisterHouses';
import EditHouses from './components/EditHouses'
import { AuthProvider } from './dataLogin';

function AppRoutes() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/accessDenied" element={<AccessDenied />} />
          <Route path="/" element={<Login />}/>
          <Route
            path="/residents"
            element={<ProtectedRoute element={<Residents />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/visits"
            element={<ProtectedRoute element={<Visits />} rolesAllowed={['admin', 'residente']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/cars"
            element={<ProtectedRoute element={<Cars />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/RegisterResident"
            element={<ProtectedRoute element={<RegisterResident />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/RegisterVisits"
            element={<ProtectedRoute element={<RegisterVisits />} rolesAllowed={['admin', 'residente']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/RegisterCars"
            element={<ProtectedRoute element={<RegisterCars />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/camara"
            element={<ProtectedRoute element={<CameraCapture />} rolesAllowed={['admin', 'garita']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/EditResident"
            element={<ProtectedRoute element={<EditResident />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/EditCars"
            element={<ProtectedRoute element={<EditCars />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/EditVisit"
            element={<ProtectedRoute element={<EditVisit />} rolesAllowed={['admin', 'residente']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/houses"
            element={<ProtectedRoute element={<Houses />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/RegisterHouses"
            element={<ProtectedRoute element={<RegisterHouses />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied" />}
          />
          <Route
            path="/EditHouses"
            element={<ProtectedRoute element={<EditHouses />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied"/>}
          />
          <Route
            path="/RekognitionConfig"
            element={<ProtectedRoute element={<RekognitionConfig />} rolesAllowed={['admin']} accessDeniedPath="/accessDenied"/>}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default AppRoutes;
