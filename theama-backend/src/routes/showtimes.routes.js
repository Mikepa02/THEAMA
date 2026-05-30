const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { showId } = req.query;
        if (!showId) return res.status(400).json({ error: 'showId απαιτείται.' });
        const [showtimes] = await pool.query('SELECT * FROM showtimes WHERE show_id = ? ORDER BY date_time', [showId]);
        res.json(showtimes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

module.exports = router;
