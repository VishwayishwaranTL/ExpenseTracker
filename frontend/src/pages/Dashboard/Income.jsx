import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { encryptData,decryptData } from "../../utils/encryption";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#8BC34A", "#E91E63"];

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [visibleIncomes, setVisibleIncomes] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    source: "",
    amount: "",
    date: "",
    description: "",
  });

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const months = [
    { value: "", label: "All Months" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const years = ["", ...Array.from({ length: 6 }, (_, i) => String(currentYear - i))];

  useEffect(() => {
    fetchIncomes();
  }, []);

  useEffect(() => {
    const filtered = filterIncomes();

    if (!selectedMonth && !selectedYear && !showAll) {
      setVisibleIncomes(filtered.slice(0, 15));
    } else {
      setVisibleIncomes(filtered);
    }
  }, [selectedMonth, selectedYear, incomes, showAll]);

  const fetchIncomes = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/income/get");
      const decrypted = res.data.map((item) => {
        const data = decryptData(item.encryptedData);
        return {
          ...data,
          _id: item._id,
          date: data.date,
        };
      });

      const sorted = decrypted.sort((a, b) => new Date(b.date) - new Date(a.date));
      setIncomes(sorted);
    } catch (err) {
      console.error("Failed to fetch incomes:", err.message);
    }
  };


  const [editingId, setEditingId] = useState(null);

  const handleEdit = (income) => {
    setFormData({
      source: income.source,
      amount: income.amount,
      date: income.date.split("T")[0],
      description: income.description || "",
    });
    setEditingId(income._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;

    try {
      await axiosInstance.delete(`/api/v1/income/${id}`);
      setIncomes((prev) => prev.filter((inc) => inc._id !== id));
    } catch (err) {
      console.error("Error deleting income:", err.message);
    }
  };

  const filterIncomes = () => {
    let filtered = incomes;
    if (selectedMonth && selectedYear) {
      filtered = filtered.filter((inc) => {
        const date = new Date(inc.date);
        return (
          date.getMonth() + 1 === parseInt(selectedMonth) &&
          date.getFullYear() === parseInt(selectedYear)
        );
      });
    } else if (selectedMonth) {
      filtered = filtered.filter((inc) => {
        const date = new Date(inc.date);
        return date.getMonth() + 1 === parseInt(selectedMonth);
      });
    } else if (selectedYear) {
      filtered = filtered.filter((inc) => {
        const date = new Date(inc.date);
        return date.getFullYear() === parseInt(selectedYear);
      });
    }
    return filtered;
  };

  const totalIncome = visibleIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  const pieData = incomes
    .filter((inc) => {
      const date = new Date(inc.date);
      const matchMonth = selectedMonth || currentMonth;
      return (
        String(date.getMonth() + 1).padStart(2, "0") === matchMonth &&
        date.getFullYear() === (selectedYear ? parseInt(selectedYear) : currentYear)
      );
    })
    .reduce((acc, inc) => {
      const found = acc.find((item) => item.name === inc.source);
      if (found) {
        found.value += inc.amount;
      } else {
        acc.push({ name: inc.source, value: inc.amount });
      }
      return acc;
    }, []);

  const selectedGraphYear = selectedYear ? parseInt(selectedYear) : currentYear;

  const lineData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = incomes
      .filter((inc) => {
        const date = new Date(inc.date);
        return date.getMonth() + 1 === month && date.getFullYear() === selectedGraphYear;
      })
      .reduce((sum, inc) => sum + inc.amount, 0);
    return {
      month: months[month].label,
      income: total,
    };
  });

  const downloadXLSX = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/api/v1/income/downloadexcel", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "incomes.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download failed:", err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { source, amount, date } = formData;

    if (!source || !amount || !date) {
      alert("Please fill in all required fields (*)");
      return;
    }

    try {
      const encryptedData = encryptData(formData);

      if (editingId) {
        await axiosInstance.put(`/api/v1/income/${editingId}`, { encryptedData });
      } else {
        await axiosInstance.post("/api/v1/income/add", { encryptedData });
      }

      setShowModal(false);
      setFormData({ source: "", amount: "", date: "", description: "" });
      setEditingId(null);
      fetchIncomes();
    } catch (err) {
      console.error("Failed to save income:", err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-md mt-4 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Incomes</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            + Add Income
          </button>
          <button
            onClick={downloadXLSX}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            📥 Download XLSX
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setShowAll(true);
          }}
          className="border px-3 py-2 rounded-md"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setShowAll(true);
          }}
          className="border px-3 py-2 rounded-md"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year === "" ? "All Years" : year}
            </option>
          ))}
        </select>

        <div className="ml-auto text-lg font-medium text-green-700">
          Total: ₹{totalIncome.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">
            {selectedMonth
              ? `Income Distribution for ${months.find(m => m.value === selectedMonth)?.label}`
              : `Income Distribution for ${months.find(m => m.value === currentMonth)?.label}`}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">
            Yearly Income Trend ({selectedYear || currentYear})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#4CAF50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {visibleIncomes.length === 0 ? (
        <p className="text-gray-500">No incomes found for selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2">Date</th>
                <th className="p-2">Source</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Description</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleIncomes.map((inc) => (
                <tr key={inc._id} className="border-b">
                  <td className="p-2">{new Date(inc.date).toLocaleDateString()}</td>
                  <td className="p-2">{inc.source}</td>
                  <td className="p-2 text-green-700">₹{inc.amount.toFixed(2)}</td>
                  <td className="p-2">{inc.description || "-"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(inc)}
                      className="bg-green-400 hover:bg-green-500 text-white px-2 py-1 rounded"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(inc._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-xl font-bold text-gray-700"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add Income</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label>Source<span className="text-red-500">*</span></label>
                <input type="text" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full border px-3 py-2 rounded-md" required />
              </div>
              <div>
                <label>Amount (₹)<span className="text-red-500">*</span></label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full border px-3 py-2 rounded-md" required />
              </div>
              <div>
                <label>Date<span className="text-red-500">*</span></label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border px-3 py-2 rounded-md" required />
              </div>
              <div>
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border px-3 py-2 rounded-md" rows={2} />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Add Income</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
