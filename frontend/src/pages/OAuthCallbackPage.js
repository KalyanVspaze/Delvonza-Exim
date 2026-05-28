import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../api/client';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing Google login...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');

    if (error) {
      setMessage('Google login failed. Please try again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    if (accessToken) {
      tokenStore.setTokens({ accessToken, refreshToken });
      // Auto-signup/login successful - redirect to profile
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        window.location.replace('/profile');
      }, 500);
      return;
    }

    setMessage('Google login did not return tokens.');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
