import { body, param, validationResult, matchedData } from 'express-validator';
import pool from '../db/mysql.js';

// Gauti visas kategorijas
export const list = async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
};

// Validatorius kategorijos kūrimui
export const createValidator = () => [
    body('name')
    .escape()
    .notEmpty()
    .withMessage('Pavadinimas privalomas')
];

// Sukurti naują kategoriją (tik admin)
export const create = async (req, res) => {
    // Patikrinti klaidas
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Įrašyti į DB
    const { name } = matchedData(req);
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
};

// Validatorius kategorijos ištrynimui
export const destroyValidator = () => [
    param('id')
    .isInt()
    .withMessage('ID turi būti skaičius')
];

// Ištrinti kategoriją (tik admin)
export const destroy = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = matchedData(req);
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true });
}