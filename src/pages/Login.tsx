import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, LogIn, Loader2, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (mode === 'signup') {
      if (!formData.displayName) {
        newErrors.displayName = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(formData.email, formData.password);
        navigate('/dashboard');
      } else if (mode === 'signup') {
        await signUpWithEmail(formData.email, formData.password, formData.displayName);
        navigate('/dashboard');
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        alert('Password reset email sent! Check your inbox.');
        setMode('signin');
      }
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'No account found with this email'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : error.message || 'Authentication failed';
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in failed:', error);
      setErrors({ submit: 'Google sign in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to continue creating amazing content';
      case 'signup': return 'Join thousands of creators using Tearix AI';
      case 'reset': return 'Enter your email to receive a password reset link';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 py-6 sm:py-12 px-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 rounded-2xl">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 px-4">
            {getTitle()}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            {getSubtitle()}
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.displayName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {mode === 'signin' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending email...'}
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {mode !== 'reset' && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="mt-4 w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="mt-6 text-center space-y-2">
                {mode === 'signin' ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setMode('signup')}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                    <p className="text-sm text-gray-600">
                      Forgot your password?{' '}
                      <button
                        onClick={() => setMode('reset')}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Reset it
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-purple-600 hover:text-purple-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-purple-600 hover:text-purple-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
              AI-Powered
            </div>
            <div className="flex items-center">
              <LogIn className="w-4 h-4 mr-1 text-blue-600" />
              Secure Login
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};