import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { Menu, X } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apipath';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, updateUser, clearUser } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // 🚀 Don't fetch if no token

      try {
        const res = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
        updateUser(res.data);
      } catch (err) {
        console.error("Navbar: Failed to fetch user:", err.message);
        clearUser(); // just clear context, don't reload
        localStorage.removeItem("token");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    clearUser();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-white border rounded-full shadow p-2 hover:bg-gray-100"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/10 z-40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-64 h-full bg-white shadow-lg p-6 flex flex-col justify-between z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button onClick={() => setIsOpen(false)}>
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border border-gray-300 shadow">
                {user?.profileImgUrl ? (
                  <img
                    src={user.profileImgUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-profile.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                    {user?.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <p className="mt-3 text-lg font-semibold text-gray-800 text-center break-words">
                {user?.fullName || user?.email || 'User'}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {location.pathname !== '/' && (
                <button
                  onClick={() => {
                    navigate('/');
                    setIsOpen(false);
                  }}
                  className="text-left text-lg font-bold px-4 py-3 rounded-lg hover:bg-gray-200"
                >
                  Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="text-left text-lg font-bold px-4 py-3 rounded-lg hover:bg-gray-200"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  navigate('/income');
                  setIsOpen(false);
                }}
                className="text-left text-lg font-bold px-4 py-3 rounded-lg hover:bg-gray-200"
              >
                Income
              </button>
              <button
                onClick={() => {
                  navigate('/expense');
                  setIsOpen(false);
                }}
                className="text-left text-lg font-bold px-4 py-3 rounded-lg hover:bg-gray-200"
              >
                Expense
              </button>
            </div>

            <div>
              <button
                onClick={handleLogout}
                className="w-full text-left text-lg font-bold px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg mt-10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
