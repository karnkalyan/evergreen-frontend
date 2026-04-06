import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/shared/Button';
import { userService } from '../lib/userService';
import { toast } from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      setProfilePictureFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview('');
  };

  const handleSubmit = async () => {
    // console.log('=== REGISTRATION DEBUG START ===');
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      const errorMsg = 'First name, last name, and email are required';
      console.error('Validation error:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!formData.password) {
      const errorMsg = 'Password is required';
      console.error('Validation error:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      console.error('Validation error:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters long';
      console.error('Validation error:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const errorMsg = 'Please enter a valid email address';
      console.error('Validation error:', errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    // console.log('Form data:', formData);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('middleName', formData.middleName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('roleId', '3'); // Use actual customer role ID
      formDataToSend.append('status', 'active');
      
      if (profilePictureFile) {
        formDataToSend.append('profilePicture', profilePictureFile);
      }

      // console.log('Sending registration request...');
      
      const response = await userService.createUser(formDataToSend);
      // console.log('Registration response:', response);

      if (response.success) {
        const successMsg = 'Account created successfully! Welcome to Evergreen Medicine.';
        // console.log('SUCCESS:', successMsg);
        toast.success(successMsg);
        // Optionally, redirect to login or another page
        navigate('/login');
        // Stay on page for debugging
      } else {
        const errorMsg = response.message || 'Registration failed. Please try again.';
        // console.error('API Error:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
  console.error('Registration error:', error);
  
  let errorMessage = 'An error occurred during registration. Please try again.';
  
  // Try to extract the error message from different possible response structures
  if (error?.response?.data?.error) {
    // Axios response structure
    errorMessage = error.response.data.error;
  } else if (error?.data?.error) {
    // Direct response structure
    errorMessage = error.data.error;
  } else if (error?.message) {
    // Error object message
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // String error
    errorMessage = error;
  }
  
  // Check for specific error patterns
  if (errorMessage.includes('User with this email already exists')) {
    errorMessage = 'An account with this email already exists. Please use a different email or login.';
  } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    errorMessage = 'Registration endpoint requires authentication. Please contact administrator.';
  } else if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
    errorMessage = 'Network error. Please check your connection and try again.';
  }
  
  toast.error(errorMessage);
}
      finally {
      setLoading(false);
      // console.log('=== REGISTRATION DEBUG END ===');
    }
  };

  // Prevent form submission on enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-slate-100 py-12">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-serif font-bold text-center text-slate-900">
            Create Account
          </h1>
          <p className="text-center text-slate-500 mt-2">
            Join Evergreen Medicine for a healthier tomorrow.
          </p>
        </div>

        {/* Remove form completely - use plain div */}
        <div className="p-6 space-y-6">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              {profilePicturePreview ? (
                <div className="relative">
                  <img 
                    src={profilePicturePreview} 
                    alt="Profile preview" 
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional: Square image, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="First name"
              />
            </div>

            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-slate-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="Middle name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Password Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                minLength={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="Enter password"
              />
              <p className="text-xs text-slate-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryStart focus:border-transparent transition-colors"
                placeholder="Confirm password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            <Button
              type="button"
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-primaryEnd hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;