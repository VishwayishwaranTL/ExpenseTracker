import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apipath';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword
} from '../../utils/helper';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    api: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors(prev => ({
      ...prev,
      [e.target.name]: '',
      api: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );

    if (!formData.fullName) {
      setErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
      return;
    }

    if (emailErr || passErr || confirmErr) {
      setErrors(prev => ({
        ...prev,
        email: emailErr,
        password: passErr,
        confirmPassword: confirmErr,
      }));
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      console.log("User signed up:", {
        fullName: formData.fullName,
        email: formData.email
      });

      alert(`Welcome, ${formData.fullName}! You have signed up successfully.`);

      localStorage.setItem('token', response.data.token);
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Signup failed. Try again.';
      setErrors(prev => ({
        ...prev,
        api: errorMsg,
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Sign Up for Expense Tracker
        </h2>

        {errors.api && (
          <p className="text-red-600 text-sm mb-4 text-center">{errors.api}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="James Bond"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-xl pr-28 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-2 top-[30px] px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-all"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl"
        >
          Sign Up
        </button>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
