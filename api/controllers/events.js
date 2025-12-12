import { body, param, validationResult, matchedData } from 'express-validator';
import pool from '../db/mysql.js';

// Gauti visus renginius (prisijungusiems vartotojams)
export const list = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT e.*, c.name as category_name, u.email as user_email
        FROM events e
        JOIN categories c ON e.category_id = c.id
        JOIN users u ON e.user_id = u.id
        ORDER BY e.id DESC
    `);
    res.json(rows);
};

// Gauti patvirtintus renginius (viešam peržiūrai)
export const publicList = async (req, res) => {
    const [rows] = await pool.query(`
        SELECT e.id, e.title, e.category_id, e.event_time, e.location, c.name as category_name
        FROM events e
        JOIN categories c ON e.category_id = c.id
        WHERE e.is_approved = TRUE
        ORDER BY e.event_time ASC
    `);
    res.json(rows);
};

// Sukurti naują rengini
export const createValidator = () => [
    body('title')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Pavadinimas yra privalomas'),
    body('category_id')
        .isInt()
        .withMessage('Kategorijos ID turi būti sveikasis skaičius'),
    body('event_time')
        .isISO8601()
        .withMessage('Renginio laikas turi būti galiojanti data'),
    body('location')
        .trim()
        .escape()
        .notEmpty()
        .withMessage('Vieta yra privaloma')
];

export const create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const { title, category_id, event_time, location } = matchedData(req);
    const [result] = await pool.query(
        'INSERT INTO events (title, category_id, event_time, location, user_id) VALUES (?, ?, ?, ?, ?)',
        [title, category_id, event_time, location, req.user.id]
    );
    res.status(201).json({ id: result.insertId, title, category_id, event_time, location });
};

// Ištrinti rengini
export const destroyValidator = () => [
    param('id')
        .isInt()
        .withMessage('Renginio ID turi būti sveikasis skaičius')
];

export const destroy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const { id } = matchedData(req);
    const [[event]] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) return res.status(404).json({ error: 'Renginys nerastas' });
    
    if (event.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Ne jūsų renginys' });
    }
  
    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true });
};

// Patvirtinti rengini (tik administratoriui)
export const approveValidator = () => [
    param('id')
        .isInt()
        .withMessage('Renginio ID turi būti sveikasis skaičius')
];

export const approve = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
    const { id } = matchedData(req);
    await pool.query('UPDATE events SET is_approved = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
};