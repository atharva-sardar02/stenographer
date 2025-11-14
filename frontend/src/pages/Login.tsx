import { useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Stenographer Logo" 
            className="mx-auto h-16 w-16 object-contain mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to Stenographer
          </h2>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <LoginForm onSuccess={handleSuccess} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleAuthButton onSuccess={handleSuccess} />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

