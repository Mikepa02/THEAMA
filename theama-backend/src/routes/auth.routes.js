const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Συμπληρώστε όλα τα πεδία (όνομα, email, κωδικός).' });
        if (password.length < 6) return res.status(400).json({ error: 'Ο κωδικός πρέπει να είναι τουλάχιστον 6 χαρακτήρες.' });
        if (!email.includes('@')) return res.status(400).json({ error: 'Μη έγκυρο email.' });

        const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Υπάρχει ήδη λογαριασμός με αυτό το email.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        res.status(201).json({ message: 'Επιτυχής εγγραφή', user_id: result.insertId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Σφάλμα διακομιστή.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Συμπληρώστε email και κωδικό.' });

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Δεν υπάρχει χρήστης με αυτό το email.' });

        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Λάθος κωδικός.' });

        const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        res.json({
            message: 'Επιτυχής σύνδεση',
            token,
            user: { user_id: user.user_id, name: user.name, email: user.email, isAdmin: user.email === 'admin@theama.gr' }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Σφάλμα διακομιστή.' });
    }
});

module.exports = router;
