import mySqlPool from '../config/db.js'; 

export const getUserByEmail = async (email) => {
  try {
    const [rows] = await mySqlPool.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData) => {
  const { first_name, middle_name, last_name, dob, gender, address, email, password } = userData;
  const connection = await mySqlPool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO users (first_name, middle_name, last_name, dob, gender, address, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, middle_name, last_name, dob, gender, address, email, password]
    );
    const userId = result.insertId;
    
    await connection.execute(
      `INSERT INTO login (user_id, email, password) VALUES (?, ?, ?)`,
      [userId, email, password]
    );

    console.log(`User with ID ${userId} created and login record inserted.`);

    await connection.commit();
    return { userId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // await mySqlPool.execute(
  //   'DELETE FROM refresh_tokens WHERE user_id = ?',
  //   [userId]
  // );

  await mySqlPool.execute(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?',
    [userId]
  );

  const [rows] = await mySqlPool.execute(
    'SELECT id FROM login WHERE user_id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('User does not exist in the login table');
  }

  await mySqlPool.execute(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

export const getRefreshToken = async (token) => {
  const [rows] = await mySqlPool.execute(
    'SELECT * FROM refresh_tokens WHERE token = ? AND revoked = FALSE AND expires_at > NOW()',
    [token]
  );
  return rows.length ? rows[0] : null;
};

export const revokeRefreshToken = async (token) => {
  await mySqlPool.execute(
    'UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?',
    [token]
  );
};

export const updateUserPassword = async (email, hashedPassword) => {
  if (!email || !hashedPassword) throw new Error("Email and hashedPassword are required");

  console.log("Updating Password for:", email);
  console.log("New Hashed Password:", hashedPassword);

  const query = "UPDATE users SET password = ? WHERE email = ?";
  await mySqlPool.execute(query, [hashedPassword, email]); 
};

