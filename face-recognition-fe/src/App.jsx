import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScanPage from './pages/ScanPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
    return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/scan" element={<PrivateRoute><Navbar /><ScanPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Navbar /><ProfilePage /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Navbar /><DashboardPage /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/scan" />} />
            </Routes>
        </BrowserRouter>
    );
}