import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      onLogin();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Login failed');
    }
  };
  return (
    <form className="login" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState();
  const fetchPhotos = async () => {
    const res = await fetch('/api/photos', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setPhotos(data);
    }
  };
  useEffect(() => { fetchPhotos(); }, []);
  const handleUpload = async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('photo', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: form
    });
    if (res.ok) { setFile(null); fetchPhotos(); }
  };
  return (
    <div>
      <form onSubmit={handleUpload} className="upload">
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <div className="gallery">
        {photos.map(p => (
          <div key={p.id} className="photo">
            <img src={`/uploads/${p.filename}`} alt="" />
            <div className="caption">{p.uploader}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchEvents = async () => {
    const res = await fetch('/api/events', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDayClick = async value => {
    setSelectedDate(value);
    const desc = prompt('Enter availability description');
    if (!desc) return;
    const iso = value.toISOString().split('T')[0];
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ date: iso, description: desc })
    });
    if (res.ok) fetchEvents();
  };

  const dateKey = selectedDate.toISOString().split('T')[0];
  const todays = events.filter(e => e.date === dateKey);

  return (
    <div>
      <Calendar onClickDay={handleDayClick} value={selectedDate} onChange={setSelectedDate} />
      <h3>Events on {dateKey}</h3>
      <ul className="event-list">
        {todays.map(e => (
          <li key={e.id}>{e.description}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [logged, setLogged] = useState(false);
  const [view, setView] = useState('gallery');
  let content;
  if (!logged) {
    content = <Login onLogin={() => setLogged(true)} />;
  } else if (view === 'gallery') {
    content = <Gallery />;
  } else {
    content = <CalendarPage />;
  }
  return (
    <div className="App">
      <h1>Tree Gallery</h1>
      {logged && (
        <div>
          <button onClick={() => setView('gallery')}>Gallery</button>
          <button onClick={() => setView('calendar')}>Calendar</button>
        </div>
      )}
      {content}
    </div>
  );
}

export default App;
