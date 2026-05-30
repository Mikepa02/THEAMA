const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { seat_id } = req.body;
        const user_id = req.user.user_id;
        if (!seat_id) return res.status(400).json({ error: 'seat_id απαιτείται.' });

        await connection.beginTransaction();
        const [seats] = await connection.query('SELECT * FROM seats WHERE seat_id = ? FOR UPDATE', [seat_id]);

        if (seats.length === 0) { await connection.rollback(); return res.status(404).json({ error: 'Δεν βρέθηκε.' }); }
        if (seats[0].status !== 'available') { await connection.rollback(); return res.status(409).json({ error: 'Η θέση είναι ήδη κατειλημμένη.' }); }

        const [result] = await connection.query('INSERT INTO reservations (user_id, seat_id) VALUES (?, ?)', [user_id, seat_id]);
        await connection.query('UPDATE seats SET status = ? WHERE seat_id = ?', ['booked', seat_id]);
        await connection.commit();

        res.status(201).json({ message: 'Επιτυχής κράτηση', reservation_id: result.insertId });
    } catch (err) {
        await connection.rollback();
        console.error('Reservation error:', err);
        res.status(500).json({ error: 'Σφάλμα.' });
    } finally {
        connection.release();
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;
        await connection.beginTransaction();

        const [reservations] = await connection.query('SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?', [id, user_id]);
        if (reservations.length === 0) { await connection.rollback(); return res.status(404).json({ error: 'Δεν βρέθηκε.' }); }

        const seat_id = reservations[0].seat_id;
        await connection.query('DELETE FROM reservations WHERE reservation_id = ?', [id]);
        await connection.query('UPDATE seats SET status = ? WHERE seat_id = ?', ['available', seat_id]);
        await connection.commit();

        res.json({ message: 'Ακυρώθηκε.' });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    } finally {
        connection.release();
    }
});

router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const [reservations] = await pool.query(
            `SELECT r.reservation_id, r.created_at,
                    s.seat_number,
                    st.date_time, st.room, st.price,
                    sh.title AS show_title,
                    t.name AS theatre_name, t.location AS theatre_location
             FROM reservations r
             JOIN seats s ON s.seat_id = r.seat_id
             JOIN showtimes st ON st.showtime_id = s.showtime_id
             JOIN shows sh ON sh.show_id = st.show_id
             JOIN theatres t ON t.theatre_id = sh.theatre_id
             WHERE r.user_id = ?
             ORDER BY st.date_time DESC`,
            [user_id]
        );
        res.json(reservations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

module.exports = router;
