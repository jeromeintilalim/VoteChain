import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const PublicRoute = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            // If token exists, redirect to the dashboard
            navigate('/dashboard');
        }
    }, [token, navigate]);

    // If the user is not authenticated, allow access to the child route
    return !token ? <Outlet /> : null;  // Render nothing if the token is present
};

export default PublicRoute;
