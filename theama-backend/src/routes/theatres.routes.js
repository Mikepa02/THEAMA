const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [theatres] = await pool.query(
            `SELECT t.*, COUNT(DISTINCT s.show_id) AS show_count
             FROM theatres t
             LEFT JOIN shows s ON s.theatre_id = t.theatre_id
             GROUP BY t.theatre_id
             ORDER BY t.name`
        );
        res.json(theatres);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

module.exports = router;
