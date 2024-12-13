import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            console.error('No token found. Redirecting to login.');
            navigate('/login');
            return;
        }
    }, []);

    // If token is present, render the child routes; otherwise, redirect to login
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
