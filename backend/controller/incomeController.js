import Income from "../model/Income.js";
import ExcelJS from "exceljs";
import { decryptData } from "../utils/encryption.js";

export const addIncome = async (req, res) => {
  const { encryptedData } = req.body;

  if (!encryptedData) {
    return res.status(400).json({ message: "Encrypted data is required." });
  }

  try {
    const income = await Income.create({
      userId: req.user.id,
      encryptedData,
    });

    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: "Error adding income", error: err.message });
  }
};

export const getAllIncome = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(incomes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching income", error: err.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user.id });

    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    await Income.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Income deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting income", error: err.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const { encryptedData } = req.body;

    if (!encryptedData) {
      return res.status(400).json({ message: "Encrypted data is required." });
    }

    const updated = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { encryptedData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Income not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating income", error: err.message });
  }
};

export const downloadIncomeExcel = async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Income");

    worksheet.columns = [
      { header: "Amount", key: "amount", width: 15 },
      { header: "Source", key: "source", width: 25 },
      { header: "Icon", key: "icon", width: 20 },
      { header: "Date", key: "date", width: 20 },
    ];

    incomes.forEach((income) => {
      const data = decryptData(income.encryptedData);

      worksheet.addRow({
        amount: data.amount,
        source: data.source,
        icon: data.icon || "",
        date: data.date,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=income.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: "Error exporting Excel", error: err.message });
  }
};
