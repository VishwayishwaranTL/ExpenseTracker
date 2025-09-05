import fs from "fs";
import path from "path";
import connectDB from "../config/db.js";
import Expense from "../model/Expense.js";
import { encryptData } from "../utils/encryption.js";

const loadExpenseData = async () => {
  try {
    await connectDB();

    const defaultUserId = "685ba46f10bc2b551eb99d89";

    const filePath = path.resolve("data", "expenseData.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const expenseArray = JSON.parse(rawData);

    for (const item of expenseArray) {
      const itemWithUser = { ...item, userId: defaultUserId };

      const encryptedData = encryptData(itemWithUser);
      const newExpense = new Expense({ encryptedData, userId: defaultUserId });
      await newExpense.save();
    }

    console.log("✅ Expense data loaded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error loading expense data:", err.message);
    process.exit(1);
  }
};

loadExpenseData();
