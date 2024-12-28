// fetchWrapper.ts
import { useAuth } from '../context/AuthContext';

const fetchWrapper = async (url: string, options: RequestInit = {}) => {
  const { logout } = useAuth();

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...(options.headers || {}), // Ensure headers is merged safely
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error('Unauthorized. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export default fetchWrapper;
