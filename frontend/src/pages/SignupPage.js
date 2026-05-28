import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FloatingButtons from '../components/common/FloatingButtons';

import { useStore } from '../context/StoreContext';

import { fetchCountriesWithDialAndLanguages } from '../utils/globalLocales';

import PasswordField from '../components/common/PasswordField';

const SignupPage = () => {

  const navigate = useNavigate();

  const {
    currentUser,
    authLoading,
    register
  } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const [country, setCountry] = useState(null);

  const [countries, setCountries] = useState([]);

  const [otp, setOtp] = useState('');

  const [otpSent, setOtpSent] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);

  const [countryLoading, setCountryLoading] = useState(true);

  const [error, setError] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  // ================= LOAD COUNTRIES =================

  useEffect(() => {

    let cancelled = false;

    async function load() {

      try {

        setCountryLoading(true);

        const list = await fetchCountriesWithDialAndLanguages();

        if (cancelled) return;

        setCountries(list);

        const locale = navigator.language || '';

        const countryPart = locale
          .split('-')[1]
          ?.toUpperCase();

        const match = countryPart
          ? list.find((c) => c.cca2 === countryPart)
          : null;

        setCountry(match || list[0] || null);

      } catch (e) {

        if (!cancelled) {

          setCountries([]);

          setCountry(null);
        }

      } finally {

        if (!cancelled) {
          setCountryLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };

  }, []);

  // ================= DIAL CODE =================

  const dialCode = useMemo(() => {

    if (!country?.dialCodes?.length) return '';

    return country.dialCodes[0];

  }, [country]);

  // ================= REDIRECT =================

  if (!authLoading && currentUser) {
    return <Navigate to="/profile" replace />;
  }

  // ================= SEND OTP =================

  const sendOtp = async () => {

    try {

      setError('');
      setSuccessMessage('');

      if (!formData.email) {
        setError('Please enter email.');
        return;
      }

      setSendingOtp(true);

      const response = await fetch(
        'http://localhost:5000/api/auth/send-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        return;
      }

      setOtpSent(true);

      setSuccessMessage('OTP sent successfully to your email.');

    } catch (error) {

      console.log(error);

      setError('Failed to send OTP.');

    } finally {

      setSendingOtp(false);
    }
  };

  // ================= HANDLE SUBMIT =================

  const handleSubmit = async (event) => {

    event.preventDefault();

    try {

      setError('');

      if (!otpSent) {
        setError('Please send OTP first.');
        return;
      }

      if (!otp) {
        setError('Please enter OTP.');
        return;
      }

      const normalizedPhone = String(
        formData.phone || ''
      ).trim();

      const fullPhone =
        normalizedPhone && dialCode
          ? `${dialCode}${normalizedPhone.replace(/^\+/, '')}`
          : normalizedPhone;

      const response = await register({
        ...formData,
        phone: fullPhone,
        otp
      });

      if (!response.success) {
        setError(response.message);
        return;
      }

      navigate('/login', {
        state: {
          message: response.message
        }
      });

    } catch (error) {

      console.log(error);

      setError('Signup failed.');
    }
  };

  return (
    <div>

      <Header />

      <section className="pt-32 pb-20 bg-gray-50 min-h-screen">

        <div className="container mx-auto px-6 max-w-xl">

          <div className="bg-white p-8 rounded-lg shadow-lg">

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h1>

            <p className="text-gray-600 mb-6">
              Register to place and track your orders.
            </p>

            {/* ERROR */}
            {error && (
              <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            {/* SUCCESS */}
            {successMessage && (
              <p className="mb-4 text-green-600 bg-green-50 p-3 rounded-lg">
                {successMessage}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NAME */}
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    name: event.target.value
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />

              {/* EMAIL + OTP BUTTON */}
              <div className="flex gap-2">

                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      email: event.target.value
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />

                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={sendingOtp}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg whitespace-nowrap"
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>

              </div>

              {/* OTP INPUT */}
              {otpSent && (
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              )}

              {/* PASSWORD */}
              <PasswordField
                placeholder="Password"
                minLength={6}
                value={formData.password}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    password: event.target.value
                  })
                }
                required
                autoComplete="new-password"
              />

              {/* PHONE */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">

                <div className="sm:col-span-5">

                  <select
                    value={country?.cca2 || ''}
                    onChange={(event) => {

                      const next =
                        countries.find(
                          (c) => c.cca2 === event.target.value
                        ) || null;

                      setCountry(next);
                    }}
                    disabled={
                      countryLoading || !countries.length
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white disabled:bg-gray-100"
                    required
                  >

                    {countries.map((c) => {

                      const langs = (c.languages || [])
                        .slice(0, 2)
                        .join(', ');

                      const label =
                        `${c.name} (${c.dialCodes[0]})` +
                        `${langs ? ` — ${langs}` : ''}`;

                      return (
                        <option
                          key={c.cca2}
                          value={c.cca2}
                        >
                          {label}
                        </option>
                      );
                    })}

                  </select>

                </div>

                <div className="sm:col-span-2 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">

                  {dialCode || '—'}

                </div>

                <div className="sm:col-span-5">

                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        phone: event.target.value
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />

                </div>

              </div>

              {/* ADDRESS */}
              <textarea
                placeholder="Address"
                value={formData.address}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    address: event.target.value
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                required
              />

              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-3 font-semibold"
              >
                Sign Up
              </button>

            </form>

            <p className="text-gray-600 mt-6">

              Already have an account?{' '}

              <Link
                className="text-primary-600 font-semibold"
                to="/login"
              >
                Login
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

export default SignupPage;