const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const theatresRoutes = require('./routes/theatres.routes');
const showsRoutes = require('./routes/shows.routes');
const showtimesRoutes = require('./routes/showtimes.routes');
const seatsRoutes = require('./routes/seats.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Theama API', version: '1.0.0' });
});

app.use('/', authRoutes);
app.use('/theatres', theatresRoutes);
app.use('/shows', showsRoutes);
app.use('/showtimes', showtimesRoutes);
app.use('/seats', seatsRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server τρέχει στο http://localhost:${PORT}`);
});
