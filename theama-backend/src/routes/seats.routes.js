const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { showtimeId } = req.query;
        if (!showtimeId) return res.status(400).json({ error: 'showtimeId απαιτείται.' });
        const [seats] = await pool.query('SELECT * FROM seats WHERE showtime_id = ? ORDER BY seat_number', [showtimeId]);
        res.json(seats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

module.exports = router;
