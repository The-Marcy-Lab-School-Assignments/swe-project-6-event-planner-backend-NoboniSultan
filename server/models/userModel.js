const pool = require('../db/pool');
const bcrypt = require('bcrypt');

const create = async (username, password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
        `INSERT INTO users (username, password_hash)
        VALUES ($1, $2)
        RETURNING user_id, username`,
        [username, passwordHash]
    );
    return rows[0];
};

const findByUsername = async (username) => {
    const { rows } = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
    );
    return rows[0] || null;
};

const findById = async (userId) => {
    const { rows } = await pool.query(
        `SELECT user_id, username FROM users WHERE user_id = $1`,
        [userId]
    );
    return rows[0] || null;
};

const updatePassword = async (userId, newPassword) => {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { rows } = await pool.query(
        `UPDATE users SET password_hash = $1
         WHERE user_id = $2
         RETURNING user_id, username`,
        [passwordHash, userId]
    );
    return rows[0] || null;
};

const remove = async (userId) => {
    const { rows } = await pool.query(
        `DELETE FROM users WHERE user_id = $1 RETURNING user_id, username`,
        [userId]
    );
    return rows[0] || null;
}

module.exports = { create, findByUsername, findById, updatePassword, remove };