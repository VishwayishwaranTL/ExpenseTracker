import Income from "../model/Income.js";
import Expense from "../model/Expense.js";
import { decryptData } from "../utils/encryption.js";

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const recentIncomesRaw = await Income.find({ userId }).sort({ date: -1 }).limit(5);
    const recentExpensesRaw = await Expense.find({ userId }).sort({ date: -1 }).limit(5);

    const recentIncomes = recentIncomesRaw.map((item) => {
      const data = decryptData(item.encryptedData);
      return {
        _id: item._id,
        date: item.date,
        ...data,
      };
    });

    const recentExpenses = recentExpensesRaw.map((item) => {
      const data = decryptData(item.encryptedData);
      return {
        _id: item._id,
        date: item.date,
        ...data,
      };
    });

    const allIncomes = await Income.find({ userId });
    const totalIncome = allIncomes.reduce((sum, item) => {
      const data = decryptData(item.encryptedData);
      return sum + (parseFloat(data.amount) || 0);
    }, 0);

    const allExpenses = await Expense.find({ userId });
    const totalExpense = allExpenses.reduce((sum, item) => {
      const data = decryptData(item.encryptedData);
      return sum + (parseFloat(data.amount) || 0);
    }, 0);

    const balance = totalIncome - totalExpense;

    const incomeTransactions = recentIncomes.map((item) => ({
      _id: item._id,
      type: "income",
      amount: item.amount,
      source: item.source,
      date: item.date,
    }));

    const expenseTransactions = recentExpenses.map((item) => ({
      _id: item._id,
      type: "expense",
      amount: item.amount,
      source: item.source,
      date: item.date,
    }));

    const allTransactions = [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
      recentIncomes,
      recentExpenses,
      recentTransactions: allTransactions,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load dashboard data",
      error: err.message,
    });
  }
};
