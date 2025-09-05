import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apipath';
import axiosInstance from '../../utils/axiosInstance';
import { validateEmail, validatePassword } from '../../utils/helper';
import { UserContext } from "../../context/userContext";

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', api: '' });

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

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError, api: '' });
      return;
    }

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);
      const { token, user: userData } = response.data;

      if (!userData) {
        console.warn("Login succeeded, but userData is missing!");
        setErrors(prev => ({ ...prev, api: "Something went wrong. Please try again." }));
        return;
      }

      localStorage.setItem('token', token);
      updateUser(userData);

      alert(`Welcome ${userData.fullName || userData.email}, you have logged in successfully!`);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Try again.";
      setErrors(prev => ({ ...prev, api: errorMsg }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Login to Expense Tracker
        </h2>

        {errors.api && (
          <p className="text-red-600 text-sm mb-4 text-center">{errors.api}</p>
        )}

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

        <div className="mb-6 relative">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="password123"
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl"
        >
          Login
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
