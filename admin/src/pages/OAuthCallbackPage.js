import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminTokenStore } from '../api/client';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Processing Google login...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const error = params.get('error');

    if (error) {
      setMessage('Google admin login failed. Please try again.');
      return;
    }

    if (accessToken) {
      adminTokenStore.set(accessToken);
      window.location.replace('/dashboard');
      return;
    }

    setMessage('Google admin login did not return a token.');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
