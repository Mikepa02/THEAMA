-- ============================================
-- THEAMA - Initial Data (Seed)
-- ============================================

USE theama;

-- Reset all data
DELETE FROM reservations;
DELETE FROM seats;
DELETE FROM showtimes;
DELETE FROM shows;
DELETE FROM theatres;
DELETE FROM users;

ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE theatres AUTO_INCREMENT = 1;
ALTER TABLE shows AUTO_INCREMENT = 1;
ALTER TABLE showtimes AUTO_INCREMENT = 1;
ALTER TABLE seats AUTO_INCREMENT = 1;
ALTER TABLE reservations AUTO_INCREMENT = 1;

-- ===== ADMIN USER =====
-- Email: admin@theama.gr  Password: admin123
-- Hashed password for admin123 (bcrypt with salt rounds 10)
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@theama.gr', '$2b$10$Pm7j7oB3aCXMqH5D1ZLXHuIzHd0fRd1eQ9tKqN3xK5Q8mK8Q1mQCW');

-- ===== THEATRES =====
INSERT INTO theatres (name, location, description) VALUES
('Εθνικό Θέατρο',    'Αθήνα, Κεντρικό', 'Το ιστορικό Εθνικό Θέατρο της Ελλάδας'),
('Θέατρο Παλλάς',    'Αθήνα, Σύνταγμα', 'Μοντέρνο θέατρο με μιούζικαλ και παραστάσεις'),
('Δημοτικό Θέατρο',  'Πειραιάς',        'Κλασικό θέατρο του Πειραιά');

-- ===== SHOWS =====
INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES
(1, 'Οιδίπους Τύραννος', 'Η κλασική τραγωδία του Σοφοκλή',          120, '12+'),
(1, 'Αντιγόνη',          'Τραγωδία του Σοφοκλή',                     110, '12+'),
(1, 'Λυσιστράτη',        'Κωμωδία του Αριστοφάνη',                   105, '15+'),
(2, 'Mamma Mia!',        'Το διάσημο μιούζικαλ',                     140, 'Όλες οι ηλικίες'),
(2, 'Cats',              'Μιούζικαλ του Andrew Lloyd Webber',        130, 'Όλες οι ηλικίες'),
(3, 'Ηλέκτρα',           'Τραγωδία του Σοφοκλή',                     115, '12+'),
(3, 'Μήδεια',            'Τραγωδία του Ευριπίδη',                    125, '15+');

-- ===== SHOWTIMES =====
INSERT INTO showtimes (show_id, date_time, room, price) VALUES
(1, '2026-06-05 20:00:00', 'Κεντρική', 18.00),
(1, '2026-06-06 20:00:00', 'Κεντρική', 18.00),
(1, '2026-06-12 21:00:00', 'Κεντρική', 18.00),
(1, '2026-06-19 20:30:00', 'Κεντρική', 20.00),
(2, '2026-06-10 19:30:00', 'Κεντρική', 16.00),
(2, '2026-06-17 19:30:00', 'Κεντρική', 16.00),
(2, '2026-06-24 19:30:00', 'Κεντρική', 18.00),
(3, '2026-06-15 21:00:00', 'Κεντρική', 20.00),
(3, '2026-06-22 21:00:00', 'Κεντρική', 20.00),
(4, '2026-06-08 19:30:00', 'Κύρια',    25.00),
(4, '2026-06-09 19:30:00', 'Κύρια',    25.00),
(4, '2026-06-15 20:00:00', 'Κύρια',    25.00),
(4, '2026-06-22 20:00:00', 'Κύρια',    28.00),
(5, '2026-06-11 20:00:00', 'Κύρια',    22.00),
(5, '2026-06-18 20:00:00', 'Κύρια',    22.00),
(5, '2026-06-25 20:00:00', 'Κύρια',    24.00),
(6, '2026-06-07 21:00:00', 'Κεντρική', 15.00),
(6, '2026-06-14 21:00:00', 'Κεντρική', 15.00),
(7, '2026-06-13 20:30:00', 'Κεντρική', 17.00),
(7, '2026-06-20 20:30:00', 'Κεντρική', 17.00);

-- ===== SEATS (40 seats A1-D10 per showtime) =====
INSERT INTO seats (showtime_id, seat_number, status)
SELECT st.showtime_id, CONCAT(letters.letter, numbers.num), 'available'
FROM showtimes st
CROSS JOIN (SELECT 'A' AS letter UNION SELECT 'B' UNION SELECT 'C' UNION SELECT 'D') letters
CROSS JOIN (SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) numbers;

-- Some pre-booked seats for the first showtime (for testing)
UPDATE seats SET status = 'booked'
WHERE showtime_id = 1 AND seat_number IN ('A1', 'A2', 'A8', 'B2', 'B3', 'B7', 'B8', 'C3', 'C4', 'C5', 'C10', 'D4', 'D7');
