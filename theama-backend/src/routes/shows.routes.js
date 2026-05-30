const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { theatreId, title } = req.query;
        let sql = 'SELECT s.*, t.name AS theatre_name FROM shows s JOIN theatres t ON t.theatre_id = s.theatre_id WHERE 1=1';
        const params = [];
        if (theatreId) { sql += ' AND s.theatre_id = ?'; params.push(theatreId); }
        if (title) { sql += ' AND s.title LIKE ?'; params.push(`%${title}%`); }
        sql += ' ORDER BY s.title';
        const [shows] = await pool.query(sql, params);
        res.json(shows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Σφάλμα.' });
    }
});

module.exports = router;
