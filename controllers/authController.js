import jwt from 'jsonwebtoken';
import { hashPassword, comparePassword } from '../middleware/passwordUtils.js';
import { getUserByEmail, createUser } from '../models/userModel.js';

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = await createUser(email, hashedPassword);

    res.status(201).json({ message: 'User registered successfully.', userId });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

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
