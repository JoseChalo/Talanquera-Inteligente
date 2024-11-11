import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import Home from './pages/Home';
import AccessCamera from './pages/accessCamera'
import Residents from './components/Residents';
import Visits from './components/Visits';
import Cars from './components/Cars';
import RegisterResident from './components/RegisterResident';
import RegisterVisits from './components/RegisterVisits';
import RegisterCars from './components/RegisterCars';
import EditResident from './components/EditResident';
import EditCars from './components/EditCars';
import EditVisit from './components/EditVisit';
import Login from './components/Login'
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './dataLogin';

function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/residents"
            element={
              <ProtectedRoute element={<Residents />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/visits"
            element={
              <ProtectedRoute element={<Visits />} allowedRoles={['admin', 'resident']} />
            }
          />
          <Route
            path="/cars"
            element={
              <ProtectedRoute element={<Cars />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/RegisterResident"
            element={
              <ProtectedRoute element={<RegisterResident />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/RegisterVisits"
            element={
              <ProtectedRoute element={<RegisterVisits />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/RegisterCars"
            element={
              <ProtectedRoute element={<RegisterCars />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/camara"
            element={
              <ProtectedRoute element={<AccessCamera />} allowedRoles={['garita', 'admin']} />
            }
          />
          <Route
            path="/EditResident"
            element={
              <ProtectedRoute element={<EditResident />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/EditCars"
            element={
              <ProtectedRoute element={<EditCars />} allowedRoles={['admin']} />
            }
          />
          <Route
            path="/EditVisit"
            element={
              <ProtectedRoute element={<EditVisit />} allowedRoles={['admin']} />
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRoutes;
