import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register); // Register a new user
router.post('/login', login);       // Log in and get a token

export default router;
