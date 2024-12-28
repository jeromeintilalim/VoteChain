import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');
    const refreshToken: string | null = localStorage.getItem('refreshToken');
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));  // Decode JWT payload
            const currentTime = Math.floor(Date.now() / 1000);  // Get current time in seconds
    
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                if (refreshToken) {
                    refreshAuthToken(refreshToken)
                        .then(newToken => {
                            localStorage.setItem('token', newToken);  // Update new access token
                        })
                        .catch(() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            navigate('/login');
                        });
                } else {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        }
    }, [token, refreshToken, navigate]);

    return token ? <Outlet /> : <Navigate to="/login" />;
};

const refreshAuthToken = async (refreshToken: string): Promise<string> => {
    const response = await fetch('http://localhost:7122/api/user/refresh-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return data.token;
};

export default PrivateRoute;
