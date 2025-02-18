import express from 'express';
import { register, login, logout, getUserInfo, changePassword, refresh } from '../controllers/authController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register); // Register a new user
router.post('/login', login); // Log in and get a token
router.post('/refresh', refresh)
router.get('/logout', logout); // Log out and get a token
router.get("/profile", getUserInfo); // profile retrived from token
router.post("/change-password", authenticateToken, changePassword)

export default router;
