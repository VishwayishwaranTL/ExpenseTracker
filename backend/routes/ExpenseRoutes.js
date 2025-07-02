import express from "express";
import {
    addExpense,
    deleteExpense,
    getAllExpense,
    downloadExpenseExcel,
    updateExpense
} from "../controller/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpense);
router.get("/downloadexcel", protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);
router.put("/:id", protect, updateExpense);

export default router;