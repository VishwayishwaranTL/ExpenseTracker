import express from "express";

import {
    addIncome,
    getAllIncome,
    deleteIncome,
    downloadIncomeExcel,
    updateIncome
} from "../controller/incomeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncome);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.delete("/:id", protect, deleteIncome);
router.put("/:id", protect, updateIncome);

export default router;