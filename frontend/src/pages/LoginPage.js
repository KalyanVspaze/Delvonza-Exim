import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FloatingButtons from '../components/common/FloatingButtons';
import { useStore } from '../context/StoreContext';
import PasswordField from '../components/common/PasswordField';
import { FcGoogle } from 'react-icons/fc'; // ✅ added

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authLoading, login } = useStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(location.state?.message || '');

  if (!authLoading && currentUser) {
    return <Navigate to="/profile" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await login(formData);
    if (!response.success) {
      setError(response.message);
      return;
    }
    navigate('/profile');
  };

  return (
    <div>
      <Header />
      <section className="pt-32 pb-20 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 max-w-lg">
          {authLoading && (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center text-gray-600 mb-6">
              Checking session...
            </div>
          )}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-600 mb-6">Sign in to manage your cart and orders.</p>

            {error && (
              <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />

              <PasswordField
                placeholder="Password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                required
                autoComplete="current-password"
              />

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-3 font-semibold"
              >
                Login
              </button>
            </form>

            {/* ✅ Google Button Updated */}
            <button
              type="button"
              onClick={() => {
                const base =
                  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
                window.location.href = `${base}/auth/google`;
              }}
              className="w-full mt-4 flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-3 font-semibold hover:bg-gray-100 transition"
            >
              <FcGoogle size={20} />
              Continue with Google
            </button>

            <p className="text-gray-600 mt-6">
              New user?{' '}
              <Link className="text-primary-600 font-semibold" to="/signup">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
      <FloatingButtons />
    </div>
  );
};

export default LoginPage;