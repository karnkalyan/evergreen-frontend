import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';
import { toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination or default to account dashboard
  const from = location.state?.from?.pathname || '/account';

  // Redirect if already authenticated
// In your LoginPage.tsx, update the useEffect:
React.useEffect(() => {
  if (isAuthenticated && user) {
    if (user.role?.name === 'Admin') {
      navigate('/admin', { replace: true });
    } else if (user.role?.name === 'customer') {
      navigate('/account', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }
}, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Logged in successfully!');
        
        // Check user role and redirect accordingly
        if (user?.role?.name === 'Customer') {
          navigate('/account', { replace: true });
        } else if (user?.role?.name === 'Admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-slate-100 py-12">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-soft-lg">
        <h1 className="text-3xl font-serif font-bold text-center text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-center text-slate-500 mb-8">Sign in to continue to Evergreen Medicine.</p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart" 
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart" 
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="h-4 w-4 bg-white rounded border-slate-300 text-primaryEnd focus:ring-primaryEnd focus:ring-offset-0" 
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-600">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-primaryEnd hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" disabled={isLoading}>
            Google
          </Button>
          <Button variant="secondary" disabled={isLoading}>
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primaryEnd hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;