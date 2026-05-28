import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import RequiredMark from '../components/RequiredMark';
import { FcGoogle } from 'react-icons/fc'; //
const AdminSignup = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onPhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !email.trim() || phone.length !== 10 || !password || !confirmPassword) {
      setError('All fields are required. Mobile must be exactly 10 digits.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        phone,
        password,
        confirmPassword
      });
      if (!result.success) {
        setError(result.message || 'Registration failed.');
        return;
      }
      navigate('/login', { replace: true, state: { message: 'Account created successfully. Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 max-h-[95vh] overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Admin sign up</h1>
        <p className="text-sm text-gray-600 mb-6">
          <RequiredMark /> All fields are required.
        </p>
        {error && <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User name
              <RequiredMark />
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              autoComplete="username"
            />
          </div>
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
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile (10 digits)
              <RequiredMark />
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              pattern="\d{10}"
              value={phone}
              onChange={onPhoneChange}
              placeholder="9876543210"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              autoComplete="tel-national"
            />
            <p className="text-xs text-gray-500 mt-1">Enter 10 digits only (India). Stored with country code +91 on the server.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-4 pr-11 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-primary-600 rounded-md"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
              <RequiredMark />
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-lg py-3 font-semibold"
          >
            {submitting ? 'Creating account…' : 'Create account'}
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
        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
