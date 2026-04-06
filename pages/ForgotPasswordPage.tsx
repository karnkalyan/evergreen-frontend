import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('If an account with that email exists, a password reset link has been sent.');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-slate-100 py-12">
      <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-soft-lg" data-aos="zoom-in-up">
        <h1 className="text-3xl font-serif font-bold text-center text-slate-900 mb-2">Forgot Your Password?</h1>
        <p className="text-center text-slate-500 mb-8">No problem. Enter your email below and we'll send you a link to reset it.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-forgot" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              id="email-forgot" 
              className="w-full p-3 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-primaryStart focus:border-primaryStart" 
              placeholder="you@example.com"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Remembered your password? <Link to="/login" className="font-medium text-primaryEnd hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;