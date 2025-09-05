import express from "express";
import {
    registerUser,
    loginUser,
    getUserInfo,
    updateProfile
} from "../controller/authcontroller.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/getUser",protect, getUserInfo);
router.put('/profile',protect, updateProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = req.file.path;

  res.status(200).json({ imageUrl });
});

export default router;