-- ============================================
-- THEAMA - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS theama
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE theama;

-- ===== USERS =====
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===== THEATRES =====
CREATE TABLE IF NOT EXISTS theatres (
    theatre_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT
);

-- ===== SHOWS =====
CREATE TABLE IF NOT EXISTS shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    theatre_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INT NOT NULL COMMENT 'Διάρκεια σε λεπτά',
    age_rating VARCHAR(20),
    FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE
);

-- ===== SHOWTIMES =====
CREATE TABLE IF NOT EXISTS showtimes (
    showtime_id INT AUTO_INCREMENT PRIMARY KEY,
    show_id INT NOT NULL,
    date_time DATETIME NOT NULL,
    room VARCHAR(50),
    price DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE
);

-- ===== SEATS =====
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    showtime_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    status ENUM('available', 'booked') DEFAULT 'available',
    FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat_per_showtime (showtime_id, seat_number)
);

-- ===== RESERVATIONS =====
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    seat_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (seat_id)
);
