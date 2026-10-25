import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/profile');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-24 pb-16 px-4 animate-fade-in">
      <div className="w-full max-w-5xl bg-white dark:bg-[#1A1625] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2D263B] flex flex-col md:flex-row overflow-hidden">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-brand-plum dark:text-[#F5F2FA] mb-1 tracking-tight">Login</h2>
            <p className="text-brand-orchid dark:text-gray-300 text-base mb-6">Welcome! Please log in to your account.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 border border-gray-200 dark:border-[#2D263B] rounded-xl focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:ring-2 focus:ring-[#5D3C64]/20 text-base transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 border border-gray-200 dark:border-[#2D263B] rounded-xl focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:ring-2 focus:ring-[#5D3C64]/20 text-base transition-colors duration-200"
                    placeholder="Please enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#5D3C64] dark:hover:text-[#A78BFA] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5D3C64] hover:bg-[#4A2F4F] text-white font-semibold py-3 text-base rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? 'Signing in...' : 'LOGIN'}
            </button>
          </form>
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#5D3C64] dark:text-[#A78BFA] font-semibold hover:underline">Sign up</Link>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#151221]">
          <img src="/login.png" alt="Login Illustration" className="max-w-md w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default Login; 