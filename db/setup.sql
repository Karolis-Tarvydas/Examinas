CREATE DATABASE IF NOT EXISTS events_db;
USE events_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    event_time DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);


-- Seedingas (password yra 'password123' hashed su bcrypt)
INSERT INTO users (email, password, role) VALUES
('admin@test.com', '$2a$10$JDBsn7VK0g.PFjTsl/wXeeBedMKXmmVJj8rY8glTeo6VKLLM3UcHC', 'admin'),
('user@test.com', '$2a$10$JDBsn7VK0g.PFjTsl/wXeeBedMKXmmVJj8rY8glTeo6VKLLM3UcHC', 'user');

INSERT INTO categories (name) VALUES
('Muzika'),
('Sportas'),
('Menas'),
('Festivalis');

INSERT INTO events (title, category_id, event_time, location, user_id, is_approved) VALUES
('Vasaros festivalis', 1, '2025-07-15 18:00:00', 'Miesto parkas', 2, TRUE),
('Krepsinio turnyras', 2, '2025-06-20 10:00:00', 'Sporto arena', 2, FALSE);