### Pagrindinės galimybės:
- Vartotojų registracija ir prisijungimas (JWT autentifikacija)
- Rolės: Administratorius ir Vartotojas
- Renginių kūrimas, peržiūra ir trynimas
- Renginių patvirtinimas (tik administratoriui)
- Viešas renginių peržiūrėjimas (be prisijungimo)
- Renginių įvertinimas žvaigždutėmis
- Kategorijų valdymas

### Technologijos:
- **Backend**: Node.js, Express.js, MySQL, JWT, bcrypt
- **Frontend**: React 18, Vite, Fetch API
- **Duomenų bazė**: MySQL (XAMPP)

## Įdiegimas

### Reikalavimai:
- Node.js (v16+)
- XAMPP su MySQL
- Git

### 1. Įdiegti priklausomybes
npm install


### 2. Sukonfigūruoti aplinką
Sukurti failą `api/.env`:
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=events_db
JWT_SECRET=secret123


### 3. Sukurti duomenų bazę
C:/xampp/mysql/bin/mysql.exe -u root < db/setup.sql


### 4. Paleisti projektą

**Backend**:
node api/app.js

**Frontend**:
npx vite --config frontend/vite.config.js


### 5. Atidaryti naršyklėje
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Demo prisijungimai
### Greitas prisijungimas puslapije šiai DEMO versijai
### Administratorius:
- **Email**: admin@test.com
- **Slaptažodis**: password123

### Vartotojas:
- **Email**: user@test.com
- **Slaptažodis**: password123

## API Endpoints

### Autentifikacija
- `POST /api/auth/register` - Registracija
- `POST /api/auth/login` - Prisijungimas

### Kategorijos
- `GET /api/categories` - Gauti visas kategorijas
- `POST /api/categories` - Sukurti kategoriją (admin)
- `DELETE /api/categories/:id` - Ištrinti kategoriją (admin)

### Renginiai
- `GET /api/events` - Gauti visus renginius (prisijungusiems)
- `GET /api/events/public` - Gauti patvirtintus renginius (viešai)
- `POST /api/events` - Sukurti renginį
- `DELETE /api/events/:id` - Ištrinti renginį
- `POST /api/events/:id/approve` - Patvirtinti renginį (admin)
- `POST /api/events/:id/rate` - Įvertinti renginį

## Duomenų bazės schema

### Lentelės:
1. **users** - Vartotojai (email, password, role)
2. **categories** - Kategorijos (name)
3. **events** - Renginiai (title, category_id, event_time, location, user_id, is_approved)
4. **ratings** - Įvertinimai (event_id)

## Autorius
Karolio Tarvydo 3JS-2 Darbas