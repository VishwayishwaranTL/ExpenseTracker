import fs from "fs";
import path from "path";
import connectDB from "../config/db.js";
import Income from "../model/Income.js";
import { encryptData } from "../utils/encryption.js";

const loadIncomeData = async () => {
  try {
    await connectDB();

    const defaultUserId = "685ba46f10bc2b551eb99d89";

    const filePath = path.resolve("data", "incomeData.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const incomeArray = JSON.parse(rawData);

    for (const item of incomeArray) {
      const itemWithUser = { ...item, userId: defaultUserId };

      const encryptedData = encryptData(itemWithUser);
      const newIncome = new Income({ encryptedData, userId: defaultUserId });
      await newIncome.save();
    }

    console.log("✅ Income data loaded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error loading income data:", err.message);
    process.exit(1);
  }
};

loadIncomeData();
