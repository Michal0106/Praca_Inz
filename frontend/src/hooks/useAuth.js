import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasValidTokens = await authAPI.initAuth();
        
        if (!hasValidTokens) {
          navigate('/login');
          setIsLoading(false);
          return;
        }

        await authAPI.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading };
};
