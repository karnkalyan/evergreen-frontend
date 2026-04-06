import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/shared/Button';
import { useAuth } from '../../context/AuthContext'; // Fixed import path

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading: isAuthLoading, isAuthenticated, user } = useAuth(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const from = location.state?.from?.pathname || '/admin';

    // Redirect if already authenticated
// In your AdminLoginPage.tsx, update the useEffect:
useEffect(() => {
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const success = await login(email, password);
            console.log('Login success status:', success);
            
            if (success && user) {
                // Check user role and redirect accordingly
                if (user.role?.name === 'Admin') {
                    navigate('/admin', { replace: true });
                } else if (user.role?.name === 'customer') { // Use lowercase 'customer'
                    navigate('/account', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            
            // Use the actual error message from the API
            if (err.message && err.message.includes('Account is disabled')) {
                setError(err.message);
            } else if (err.message && err.message.includes('Invalid credentials')) {
                setError('Invalid email or password. Please check your credentials.');
            } else if (err.message) {
                // Use the actual API error message
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDisabled = isSubmitting || isAuthLoading;

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-sm mx-auto p-8 bg-white rounded-2xl shadow-soft-lg">
                <div className="text-center mb-8">
                    <h1 className="font-poppins font-bold text-primaryStart text-3xl">Evergreen Admin</h1>
                    <p className="text-slate-500">Sign in to manage your store.</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
                            <p>{error}</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart" 
                            placeholder="you@example.com"
                            required
                            disabled={isDisabled}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="password-login" className="block text-sm font-medium text-slate-700">Password</label>
                            <Link to="/forgot-password" className="text-sm font-medium text-primaryEnd hover:underline">Forgot password?</Link>
                        </div>
                        <input 
                            type="password" 
                            id="password-login" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart" 
                            placeholder="••••••••"
                            required
                            disabled={isDisabled}
                        />
                    </div>
                    <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={isDisabled}
                    >
                        {isSubmitting || isAuthLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>
                
                {/* Show warning message for customer users */}
                {user && user.role?.name === 'customer' && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
                        <p>You are logged in as a customer. Redirecting to your account dashboard...</p>
                    </div>
                )}
                
                <p className="text-center text-xs text-slate-500 mt-6">
                    <Link to="/" className="font-medium text-primaryEnd hover:underline">← Back to Storefront</Link>
                </p>
                
                {/* Customer login hint */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    <p className="font-medium">Customer Login?</p>
                    <p>If you're a customer, please use the <Link to="/login" className="font-medium underline">storefront login</Link> instead.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;