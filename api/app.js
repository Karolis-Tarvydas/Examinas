import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Įkelti aplinkos kintamuosius PIRMA visko!
dotenv.config({ path: join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import { initPassport } from './controllers/auth.js';

// Importuoti maršrutus
import authRouter from './routes/auth.js';
import categoriesRouter from './routes/categories.js';
import eventsRouter from './routes/events.js';

// Sukurti Express aplikaciją
const app = express();
const port = process.env.PORT || 5000;

// Middleware - tarpinės programos
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Inicializuoti JWT strategiją
initPassport();

// API maršrutai
app.get('/api/', (req, res) => res.json({ message: 'Renginių API' }));
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/events', eventsRouter);

// Klaidų apdorojimas
app.use((req, res) => res.status(404).json({ error: 'Nerastas' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Serverio klaida' });
});

// Paleisti serverį
app.listen(port, () => console.log(`API veikia: http://localhost:${port}`));