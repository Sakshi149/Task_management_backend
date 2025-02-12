import db from '../config/db.js'; // Your MySQL connection

export const getUserByEmail = async (email) => {
  const [user] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return user[0];
};

export const createUser = async (email, hashedPassword) => {
  const [result] = await db.execute(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword]
  );
  return result.insertId;
};
