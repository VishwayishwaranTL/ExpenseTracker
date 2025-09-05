import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  encryptedData: { type: String, required: true },
}, { timestamps: true });

const Expense = mongoose.model("Expense", ExpenseSchema);

export default Expense;
