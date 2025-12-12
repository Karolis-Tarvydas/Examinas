import { body, validationResult, matchedData } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import pool from '../db/mysql.js';

// Inicializuoti JWT strategiją

// Funkcija patikrina ar tokenas galiojantis ir suranda vartotoją
export const initPassport = () => {
    passport.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Gauti token iš Authorization header
        secretOrKey: process.env.JWT_SECRET
    }, async (payload, done) => {
        try {
            // Surasti vartotoją pagal ID iš tokeno
            const [[user]] = await pool.query('SELECT id, email, role FROM users WHERE id = ?', [payload.id]);
            if (!user) return done(null,false);
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }));
};

// Middleware patikrinti ar vartotojas prisijungęs
export const isAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ error: 'Neprisijungęs' });
        req.user = user;
        next();
    })(req, res, next);
};

// Middleware patikrinti ar vartotojas yra administratorius
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Tik admin' });
    next();
};

// Validatoriai registracijai
export const registerValidator = () => [
    body('email')
        .trim()
        .escape()
        .isEmail()
        .withMessage("El. paštas turi būti galiojantis")
        .notEmpty()
        .withMessage("El. paštas privalomas"),
    body('password')
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Slaptažodis privalomas")
        .isLength({ min: 6 })
        .withMessage("Slaptažodis turi būti bent 6 simbolių"),
];

// Registracijos funkcija
export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Gauti validuotus duomenis
    const { email, password } = matchedData(req);
    
    // Patikrinti ar vartotojas jau egzistuoja
    const [[exists]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists) return res.status(400).json({ error: 'El. paštas jau užimtas' });

    const hashed = await bcrypt.hash(password, 10);
    
    // Įrašyti į duomenų bazę
    const [result] = await pool.query('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [email, hashed, 'user']);
    
    // Sukurti JWT tokeną (automatiškai prisijungti po registracijos)
    const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
        token, 
        user: { id: result.insertId, email, role: 'user' }
    });
};

// Validatoriai prisijungimui
export const loginValidator = () => [
    body("email")
        .trim()
        .escape()
        .isEmail()
        .withMessage("El. paštas turi būti galiojantis")
        .notEmpty()
        .withMessage("El. paštas privalomas"),
    body("password")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Slaptažodis privalomas"),
];

// Prisijungimo funkcija
export const login = async (req, res ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = matchedData(req);
    
    // Surasti vartotoją pagal el. paštą
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' });

    // Palyginti slaptažodį su užšifruotu
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Neteisingas el. paštas arba slaptažodis' });

    // Sukurti JWT tokeną
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Grąžinti tokeną ir vartotojo duomenis
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
};