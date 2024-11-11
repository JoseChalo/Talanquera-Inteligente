import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Residents from './components/Residents';
import Visits from './components/Visits';
import Cars from './components/Cars';
import RegisterResident from './components/RegisterResident';
import RegisterVisits from './components/RegisterVisits';
import RegisterCars from './components/RegisterCars';
import CameraCapture from './getUserMedia';
import EditResident from './components/EditResident';
import EditCars from './components/EditCars'
import EditVisit from './components/EditVisit'


// Función para verificar si el usuario está autenticado
const isAuthenticated = () => !!localStorage.getItem('authToken');

// Componente de ruta protegida
const ProtectedRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" replace />;
};


function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/residents" element={<Residents />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/RegisterResident" element={<RegisterResident />} />
        <Route path="/RegisterVisits" element={<RegisterVisits />} />
        <Route path="/RegisterCars" element={<RegisterCars />} />
        <Route path="/camara" element={<CameraCapture />} />
        <Route path="/EditResident" element={<EditResident/>} />
        <Route path="/EditCars" element={<EditCars/>} />
        <Route path="/EditVisit" element={<EditVisit/>} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;