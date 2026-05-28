import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ================= SEND OTP =================

  const sendOtp = async () => {

    try {

      setLoading(true);

      setError('');
      setMessage('');

      const response = await fetch(
        'http://localhost:5000/api/auth/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(data.message || 'Failed to send OTP.');

        return;
      }

      setMessage(data.message);

      setStep(2);

    } catch (error) {

      console.log(error);

      setError('Failed to send OTP.');

    } finally {

      setLoading(false);
    }
  };

  // ================= RESET PASSWORD =================

  const resetPassword = async () => {

    try {

      setLoading(true);

      setError('');
      setMessage('');

      const response = await fetch(
        'http://localhost:5000/api/auth/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(data.message || 'Reset failed.');

        return;
      }

      setMessage(data.message);

      setStep(3);

    } catch (error) {

      console.log(error);

      setError('Reset failed.');

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold mb-2">
          Forgot Password
        </h1>

        <p className="text-gray-600 mb-6">
          Reset your account password using OTP.
        </p>

        {error && (
          <p className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </p>
        )}

        {message && (
          <p className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </p>
        )}

        {/* STEP 1 */}

        {step === 1 && (

          <div>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

          </div>
        )}

        {/* STEP 2 */}

        {step === 2 && (

          <div>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6)
                )
              }
              className="w-full border px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="w-full border px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

          </div>
        )}

        {/* STEP 3 */}

        {step === 3 && (

          <div>

            <Link
              to="/login"
              className="block text-center w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold"
            >
              Back To Login
            </Link>

          </div>
        )}

        <Link
          to="/login"
          className="block text-center mt-5 text-primary-600 font-semibold"
        >
          Back to login
        </Link>

      </div>

    </div>
  );
};

export default ForgotPasswordPage;
