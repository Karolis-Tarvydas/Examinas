import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

export default function App() {
  // === AUTENTIFIKACIJOS BŪSENA ===

  // JWT token iš localStorage (jei prisijungęs)
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  
  // Vartotojo informacija (email, role)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : {};
  });
  
  // Dabartinis vaizdas: 'admin' arba 'public'
  const [view, setView] = useState('admin');
  
  // === LOGIN/REGISTER BŪSENA ===

  // Režimas: 'login' arba 'register'
  const [authMode, setAuthMode] = useState('login');
  // Autentifikacijos formos duomenys
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  
  // === DUOMENŲ BŪSENA ===

  // Renginių sąrašas
  const [events, setEvents] = useState([]);
  // Kategorijų sąrašas
  const [categories, setCategories] = useState([]);
  // Renginio sukūrimo forma
  const [form, setForm] = useState({ title: '', category_id: '', event_time: '', location: '' });
  // Klaidos pranešimas
  const [error, setError] = useState('');

  // === DUOMENŲ ĮKĖLIMAS ===

  // useEffect - vykdomas kai keičiasi token arba view
  useEffect(() => {
    fetchCategories();
    if (token && view === 'admin') fetchEvents();
    if (view === 'public') fetchPublicEvents();
  }, [token, view]);

  // === DUOMENŲ UŽKROVIMO FUNKCIJOS ===
  
  // Gauti visas kategorijas (viešai prieinamos)
  async function fetchCategories() {
    const res = await fetch(`${API}/categories`);
    const data = await res.json();
    setCategories(data);
  }

  // Gauti visus renginius (reikia būti prisijungus)
  async function fetchEvents() {
    try {
      const res = await fetch(`${API}/events`, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError('Nepavyko užkrauti renginių');
    }
  }

  // Gauti tik patvirtintus renginius (viešas endpoint, be autentifikacijos)
  async function fetchPublicEvents() {
    const res = await fetch(`${API}/events/public`);
    const data = await res.json();
    setEvents(data);
  }

  // === AUTENTIFIKACIJOS FUNKCIJOS ===
  
  // Prisijungimo/registracijos forma
  async function handleAuth(e) {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/login' : '/register';
      
      // fetch POST užklausa
      const res = await fetch(`${API}/auth${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Autentifikacija nepavyko');
      }
      
      // Išsaugoti token į localStorage (kad išliktų po puslapio perkrovimo)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      // Išvalyti formą ir klaidas
      setAuthForm({ email: '', password: '' });
      setError('');
    } catch (err) {
      setError(err.message || 'Autentifikacija nepavyko');
    }
  }

  // === RENGINIŲ VALDYMO FUNKCIJOS ===
  
  // Renginio sukūrimas
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // POST užklausa naujam renginiui
      await fetch(`${API}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      fetchEvents(); // Atnaujinti sąrašą
      setForm({ title: '', category_id: '', event_time: '', location: '' }); // Išvalyti formą
    } catch (err) {
      setError('Nepavyko sukurti renginio');
    }
  }

  // Renginio ištrynimas
  async function handleDelete(id) {
    try {
      await fetch(`${API}/events/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      fetchEvents();
    } catch (err) {
      setError('Nepavyko ištrinti renginio');
    }
  }

  // Renginio patvirtinimas (tik administratoriui)
  async function handleApprove(id) {
    try {
      await fetch(`${API}/events/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Reikia admin rolės
        },
        body: JSON.stringify({})
      });
      fetchEvents();
    } catch (err) {
      setError('Nepavyko patvirtinti renginio');
    }
  }

  // === KOMPONENTŲ RENDERINIMAS ===
  
  // LOGIN/REGISTER VAIZDAS (jei neprisijungęs ir ne viešas vaizdas)
  if (!token && view !== 'public') {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
        <h1>{authMode === 'login' ? 'Login' : 'Register'}</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleAuth}>
          <input
            required
            type="email"
            placeholder="El. paštas"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <input
            required
            type="password"
            placeholder="Slaptažodis (min 6 simboliai)"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            {authMode === 'login' ? 'Prisijungti' : 'Registruotis'}
          </button>
        </form>
        <button
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          style={{ width: '100%', padding: '10px' }}
        >
          {authMode === 'login' ? 'Sukurti paskyrą' : 'Grįžti į Login'}
        </button>
        
        {/* Demo prisijungimo mygtukai (demonstracijai) */}
        {authMode === 'login' && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '14px' }}>Greitas prisijungimas:</p>
            {/* Automatiškai užpildo admin kredencialus */}
            <button
              onClick={() => setAuthForm({ email: 'admin@test.com', password: 'password123' })}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              Užpildyti Admin duomenis
            </button>
            <button
              onClick={() => setAuthForm({ email: 'user@test.com', password: 'password123' })}
              style={{ width: '100%', padding: '8px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              Užpildyti Vartotojo duomenis
            </button>
          </div>
        )}

        {/* Mygtukas peržiūrėti viešus renginius be prisijungimo */}
        <button
          onClick={() => setView('public')}
          style={{ width: '100%', padding: '10px', marginTop: '10px', background: '#2196F3', color: 'white' }}
        >
          Peržiūrėti viešus renginius
        </button>
      </div>
    );
  }

  // === VIEŠŲ RENGINIŲ VAIZDAS ===

  // Visi gali matyti patvirtintus renginius be prisijungimo
  if (view === 'public') {
    return (
      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>Vieši renginiai</h1>
          <div>
            {/* Jei prisijungęs - rodyti mygtuką į admin panelę */}
            {token ? (
              <button onClick={() => setView('admin')} style={{ padding: '8px 16px' }}>
                Grįžti į valdymą
              </button>
            ) : (
              /* Jei neprisijungęs - rodyti mygtuką grįžti į login */
              <button onClick={() => setView('admin')} style={{ padding: '8px 16px', background: '#4CAF50', color: 'white' }}>
                Grįžti į Login
              </button>
            )}
          </div>
        </div>

        {/* Grid layout - kortelės su renginiais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {events.map(ev => (
            <div key={ev.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h3>{ev.title}</h3>
              <p><strong>{ev.category_name}</strong></p>
              <p>{new Date(ev.event_time).toLocaleString()}</p>
              <p>{ev.location}</p>
            </div>
          ))}
        </div>
        {/* Pranešimas jei nėra renginių */}
        {events.length === 0 && <p>Renginių nerasta</p>}
      </div>
    );
  }

  // === ADMINISTRATORIAUS/VARTOTOJO VALDYMO SKYDELIS ===

  // Matomas tik prisijungusiems vartotojams
  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Valdymo skydelis - {user.role === 'admin' ? 'Administratorius' : 'Vartotojas'}</h1>
        <div>
          <button onClick={() => setView('public')} style={{ padding: '8px 16px', marginRight: '10px' }}>
            Viešas vaizdas
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              setToken(null);
              setUser({});
            }}
            style={{ padding: '8px 16px', background: '#f44336', color: 'white' }}
          >
            Atsijungti
          </button>
        </div>
      </div>

      {/* Klaidos pranešimas */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* RENGINIO SUKŪRIMO FORMA */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', background: '#f9f9f9' }}>
        <h2>Sukurti naują renginį</h2>
        
        {/* Pavadinimo laukas */}
        <input
          required
          placeholder="Renginio pavadinimas"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} // Atnaujina state
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
        />
        
        {/* Kategorijos pasirinkimas */}
        <select
          required
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
        >
          <option value="">Pasirinkite kategoriją</option>
          {/* Dinaminė kategorijų lista iš DB */}
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input
          required
          type="datetime-local"
          value={form.event_time}
          onChange={(e) => setForm({ ...form, event_time: e.target.value })}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
        />
        {/* Vietos laukas */}
        <input
          required
          placeholder="Vieta"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          style={{ display: 'block', marginBottom: '10px', padding: '8px', width: '100%' }}
        />
        
        {/* Pateikimo mygtukas */}
        <button type="submit" style={{ padding: '10px 20px' }}>
          Sukurti
        </button>
      </form>

      {/* RENGINIŲ LENTELĖ */}
      <h2>Visi renginiai</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Pavadinimas</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Kategorija</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Laikas</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Vieta</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Būsena</th>
            <th style={{ padding: '10px' }}>Veiksmai</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{ev.title}</td>
              <td style={{ padding: '10px' }}>{ev.category_name}</td>
              <td style={{ padding: '10px' }}>{new Date(ev.event_time).toLocaleString()}</td>
              <td style={{ padding: '10px' }}>{ev.location}</td>
              <td style={{ padding: '10px' }}>
                {/* Patvirtinimo būsena */}
                {ev.is_approved ? 
                  <span style={{ color: 'green' }}>Patvirtinta</span> : 
                  <span style={{ color: 'orange' }}>Laukiama</span>
                }
              </td>
              <td style={{ padding: '10px' }}>
                {/* Ištrynimo mygtukas (rodo tik savininkas arba admin) */}
                {(ev.user_id === user.id || user.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(ev.id)}
                    style={{ padding: '5px 10px', marginRight: '5px', background: '#f44336', color: 'white' }}
                  >
                    Ištrinti
                  </button>
                )}
                {/* Patvirtinimo mygtukas (rodo tik adminui ir tik nepatvirtintiems) */}
                {user.role === 'admin' && !ev.is_approved && (
                  <button
                    onClick={() => handleApprove(ev.id)}
                    style={{ padding: '5px 10px', background: '#2196F3', color: 'white' }}
                  >
                    Patvirtinti
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}