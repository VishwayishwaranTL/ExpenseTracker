import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apipath';
import Navbar from '../../components/navbar.jsx';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

const Home = () => {
  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);

      const { totalIncome, totalExpense, balance, recentTransactions } = response.data;

      setDashboardData({
        totalIncome,
        totalExpense,
        balance,
        recentTransactions,
      });

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { totalIncome, totalExpense, balance, recentTransactions } = dashboardData;

  const pieData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense },
    { name: 'Balance', value: balance },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Expense Tracker
        </h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-white">
              <div className="bg-green-500 p-6 rounded-2xl text-center">
                <h2 className="text-lg font-semibold">Total Income</h2>
                <p className="text-xl mt-2">₹{totalIncome}</p>
              </div>
              <div className="bg-red-500 p-6 rounded-2xl text-center">
                <h2 className="text-lg font-semibold">Total Expense</h2>
                <p className="text-xl mt-2">₹{totalExpense}</p>
              </div>
              <div className="bg-blue-500 p-6 rounded-2xl text-center">
                <h2 className="text-lg font-semibold">Balance</h2>
                <p className="text-xl mt-2">₹{balance}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-700">Recent Transactions</h3>
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500">No transactions found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentTransactions.map((tx) => (
                      <li
                        key={tx._id}
                        className="py-2 grid grid-cols-3 items-center text-sm sm:text-base"
                      >
                        <span className="capitalize text-left text-gray-700">
                          {tx.type} - {tx.source}
                        </span>
                        <span
                          className={`text-center font-semibold ${
                            tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ₹{tx.amount}
                        </span>
                        <span className="text-right text-gray-500 text-xs sm:text-sm">
                          {new Date(tx.date).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-700 text-center">Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
