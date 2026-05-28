import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import RequiredMark from '../components/RequiredMark';
import { FcGoogle } from 'react-icons/fc'; 
const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Login failed.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Delvonza Exim — Admin Panel</p>
        {message && <p className="mb-4 text-green-800 bg-green-50 p-3 rounded-lg text-sm">{message}</p>}
        {error && <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
              <RequiredMark />
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
              <RequiredMark />
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-md"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg py-3 font-semibold"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
            window.location.href = `${base}/admin/auth/google`;
          }}
           className="w-full mt-4 flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-3 font-semibold hover:bg-gray-100 transition"
            >
          <FcGoogle size={20} />
          Continue with Google
        </button>
        <div className="mt-6 flex flex-col gap-2 text-sm text-center text-gray-600">
          <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
            Forgot password?
          </Link>
          <p>
            No account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Create admin account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
