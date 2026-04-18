import pool from '../../db/connection.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';
const JWT_EXPIRES_IN = '7d';

export const registerUser = async (userData) => {
    const { name, email, phone, password, Region, district, Address, role } = userData;

    const [existingUser] = await pool.query(
        'SELECT userid FROM users WHERE email = ?',
        [email]
    );
    if (existingUser.length > 0) {
        throw new Error('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const assignedRole = (role === 'technician') ? 'technician' : 'customer';

    const [result] = await pool.query(
        `INSERT INTO users (name, email, phone, password, Region, district, Address, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, phone, hashedPassword, Region, district, Address, assignedRole]
    );

    return result.insertId;
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
    // 1. Check users table
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password).catch(() => false) || user.password === password;
        if (!passwordMatch) throw new Error('Invalid email or password');

        const token = jwt.sign({ id: user.userid, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { token, user: { id: user.userid, name: user.name, email: user.email, role: user.role } };
    }

    // 2. Check technicians table (👈 THIS IS THE FIX!)
    const [technicians] = await pool.query('SELECT * FROM technicians WHERE email = ?', [email]);
    if (technicians.length > 0) {
        const tech = technicians[0];
        // We use || tech.password === password to allow your plain-text database entries to work!
        const passwordMatch = await bcrypt.compare(password, tech.password).catch(() => false) || tech.password === password;
        if (!passwordMatch) throw new Error('Invalid email or password');

        const token = jwt.sign({ id: tech.technician_id, role: 'technician' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { token, user: { id: tech.technician_id, name: tech.name, email: tech.email, role: 'technician' } };
    }

    // 3. Check admins table
    const [admins] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (admins.length > 0) {
        const admin = admins[0];
        const passwordMatch = await bcrypt.compare(password, admin.password).catch(() => false) || admin.password === password;
        if (!passwordMatch) throw new Error('Invalid email or password');

        const token = jwt.sign({ id: admin.admin_Id, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return { token, user: { id: admin.admin_Id, name: admin.name, email: admin.email, role: 'admin' } };
    }

    throw new Error('Invalid email or password');
};