const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Middleware: check if user is admin
function isAdmin(req, res, next) {
    if (req.user.email !== 'admin@theama.gr') {
        return res.status(403).json({ error: 'Δεν έχετε δικαιώματα admin.' });
    }
    next();
}

// GET /admin/stats - dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT COUNT(*) AS c FROM users WHERE email != ?', ['admin@theama.gr']);
        const [theatres] = await pool.query('SELECT COUNT(*) AS c FROM theatres');
        const [shows] = await pool.query('SELECT COUNT(*) AS c FROM shows');
        const [reservations] = await pool.query('SELECT COUNT(*) AS c FROM reservations');
        const [revenue] = await pool.query(`
            SELECT COALESCE(SUM(st.price), 0) AS total
            FROM reservations r
            JOIN seats s ON s.seat_id = r.seat_id
            JOIN showtimes st ON st.showtime_id = s.showtime_id
        `);
        res.json({
            users: users[0].c,
            theatres: theatres[0].c,
            shows: shows[0].c,
            reservations: reservations[0].c,
            revenue: parseFloat(revenue[0].total)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// GET /admin/reservations - all reservations
router.get('/reservations', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.reservation_id, r.created_at,
                   u.name AS user_name, u.email AS user_email,
                   s.seat_number,
                   st.date_time, st.room, st.price,
                   sh.title AS show_title,
                   t.name AS theatre_name
            FROM reservations r
            JOIN users u ON u.user_id = r.user_id
            JOIN seats s ON s.seat_id = r.seat_id
            JOIN showtimes st ON st.showtime_id = s.showtime_id
            JOIN shows sh ON sh.show_id = st.show_id
            JOIN theatres t ON t.theatre_id = sh.theatre_id
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// POST /admin/theatres - add new theatre
router.post('/theatres', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, location, description } = req.body;
        if (!name || !location) return res.status(400).json({ error: 'Όνομα και τοποθεσία απαιτούνται.' });
        const [result] = await pool.query(
            'INSERT INTO theatres (name, location, description) VALUES (?, ?, ?)',
            [name, location, description || '']
        );
        res.status(201).json({ theatre_id: result.insertId, message: 'Θέατρο προστέθηκε' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// DELETE /admin/theatres/:id
router.delete('/theatres/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM theatres WHERE theatre_id = ?', [req.params.id]);
        res.json({ message: 'Διαγράφηκε' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// POST /admin/shows - add new show
router.post('/shows', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { theatre_id, title, description, duration, age_rating } = req.body;
        if (!theatre_id || !title || !duration) return res.status(400).json({ error: 'Συμπληρώστε όλα τα πεδία.' });
        const [result] = await pool.query(
            'INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES (?, ?, ?, ?, ?)',
            [theatre_id, title, description || '', duration, age_rating || 'Όλες οι ηλικίες']
        );
        res.status(201).json({ show_id: result.insertId, message: 'Παράσταση προστέθηκε' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// DELETE /admin/shows/:id
router.delete('/shows/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM shows WHERE show_id = ?', [req.params.id]);
        res.json({ message: 'Διαγράφηκε' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// POST /admin/showtimes - add showtime + auto-create 40 seats
router.post('/showtimes', authenticateToken, isAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { show_id, date_time, room, price } = req.body;
        if (!show_id || !date_time || !price) return res.status(400).json({ error: 'Συμπληρώστε όλα τα πεδία.' });

        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO showtimes (show_id, date_time, room, price) VALUES (?, ?, ?, ?)',
            [show_id, date_time, room || 'Κεντρική', price]
        );
        const showtimeId = result.insertId;

        // Auto-create 40 seats (A1-D10)
        const rows = ['A', 'B', 'C', 'D'];
        for (const row of rows) {
            for (let i = 1; i <= 10; i++) {
                await connection.query(
                    'INSERT INTO seats (showtime_id, seat_number, status) VALUES (?, ?, ?)',
                    [showtimeId, `${row}${i}`, 'available']
                );
            }
        }
        await connection.commit();
        res.status(201).json({ showtime_id: showtimeId, message: 'Showtime + 40 θέσεις δημιουργήθηκαν' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    } finally {
        connection.release();
    }
});

// DELETE /admin/showtimes/:id
router.delete('/showtimes/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM showtimes WHERE showtime_id = ?', [req.params.id]);
        res.json({ message: 'Διαγράφηκε' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

// DELETE /admin/reservations/:id
router.delete('/reservations/:id', authenticateToken, isAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();
        const [rows] = await connection.query('SELECT seat_id FROM reservations WHERE reservation_id = ?', [id]);
        if (rows.length > 0) {
            await connection.query('UPDATE seats SET status = ? WHERE seat_id = ?', ['available', rows[0].seat_id]);
        }
        await connection.query('DELETE FROM reservations WHERE reservation_id = ?', [id]);
        await connection.commit();
        res.json({ message: 'Διαγράφηκε' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
