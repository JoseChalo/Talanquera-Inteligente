import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Residents from './components/Residents';
import Visits from './components/Visits';
import Cars from './components/Cars';
import RegisterResident from './components/RegisterResident';
import CameraCapture from './getUserMedia';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/residents" element={<Residents />} />
        <Route path="/visits" element={<Visits />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/RegisterResident" element={<RegisterResident />} />
        <Route path="/camara" element={<CameraCapture />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;