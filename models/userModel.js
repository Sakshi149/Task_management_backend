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

    await connection.commit();
    return { userId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateUserPassword = async (email, hashedPassword) => {
  if (!email || !hashedPassword) throw new Error("Email and hashedPassword are required");

  console.log("Updating Password for:", email);
  console.log("New Hashed Password:", hashedPassword);

  const query = "UPDATE users SET password = ? WHERE email = ?";
  await mySqlPool.execute(query, [hashedPassword, email]); 
};

