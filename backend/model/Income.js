import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  encryptedData: { type: String, required: true }
}, { timestamps: true });

const Income = mongoose.model("Income",IncomeSchema);

export default Income;