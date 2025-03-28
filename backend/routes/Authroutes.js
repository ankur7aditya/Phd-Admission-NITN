import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// 🔹 Register New User
router.post("/register", register);

// 🔹 Login User
router.post("/login", login);

module.exports = router;