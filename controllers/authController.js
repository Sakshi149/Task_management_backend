import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../middleware/passwordUtils.js';
import { getUserByEmail, createUser, updateUserPassword } from '../models/userModel.js';
import mySqlPool from '../config/db.js';     
import bcrypt from 'bcrypt';
 
           

export const register = async (req, res) => {
  const { first_name, middle_name, last_name, dob, gender, address, email, password } = req.body;

  console.log("Incoming Registration Data:", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await hashPassword(password);

    const userId = await createUser({ first_name, middle_name, last_name, dob, gender, address, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully.', userId });
  } catch (err) {
    console.error("Error in register function:", err);
    // res.status(500).json({ error: 'Internal server error.' });
    if (err instanceof Error) {
      console.error("Error details:", err.message);
      res.status(500).json({ error: 'Internal server error.', details: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ error: 'Unknown error occurred.', details: JSON.stringify(err) });
    }
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Incoming login Data:", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
};

export const getUserInfo = async (req, res) => {
  try {
    const { email } = req.params;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userData = await getUserByEmail(decoded.email);
    if (!userData) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json(userData);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
    }
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const changePassword = async (req, res) => {
  console.log("Request User Object:", req.user); 

  if (!req.user || !req.user.email) {
    return res.status(400).json({ error: "User email is missing from authentication." });
  }

  const userEmail = req.user.email;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await getUserByEmail(userEmail);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userEmail, hashedPassword);

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
