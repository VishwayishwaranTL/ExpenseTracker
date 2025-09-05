import Expense from "../model/Expense.js";
import ExcelJS from "exceljs";
import { decryptData } from "../utils/encryption.js";

export const addExpense = async (req, res) => {
  const { encryptedData } = req.body;

  if (!encryptedData) {
    return res.status(400).json({ message: "Encrypted data is required." });
  }

  try {
    const expense = await Expense.create({
      userId: req.user.id,
      encryptedData,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: "Error adding expense", error: err.message });
  }
};

export const getAllExpense = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting expense", error: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ message: "Encrypted data is required." });
    }

    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { encryptedData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating expense", error: err.message });
  }
};

export const downloadExpenseExcel = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    worksheet.columns = [
      { header: "Amount", key: "amount", width: 15 },
      { header: "Source", key: "source", width: 25 },
      { header: "Category", key: "category", width: 20 },
      { header: "Icon", key: "icon", width: 20 },
      { header: "Description", key: "description", width: 30 },
      { header: "Date", key: "date", width: 20 },
    ];

    expenses.forEach((expense) => {
      const data = decryptData(expense.encryptedData);
      worksheet.addRow({
        amount: data.amount,
        source: data.source,
        category: data.category,
        icon: data.icon || "",
        description: data.description || "",
        date: data.date,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: "Error exporting Excel", error: err.message });
  }
};
