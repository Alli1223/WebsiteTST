import React, { useState, useEffect } from 'react';
import './App.css';

function DriveManager() {
  const [info, setInfo] = useState({ sdReader: false, mounts: [] });
  const [device, setDevice] = useState('');
  const [mountpoint, setMountpoint] = useState('');

  const refresh = async () => {
    const res = await fetch('http://localhost:5000/api/drives');
    if (res.ok) {
      const data = await res.json();
      setInfo(data);
    }
  };

  const handleMount = async () => {
    const res = await fetch('http://localhost:5000/api/mount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device, mountpoint })
    });
    if (res.ok) {
      setDevice('');
      setMountpoint('');
      refresh();
    } else {
      alert('Mount failed');
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="drive-manager">
      <button onClick={refresh}>Refresh Drives</button>
      {info.sdReader && info.mounts.length === 0 && (
        <div>
          <p>SD card reader detected but not mounted.</p>
          <input
            placeholder="Device path"
            value={device}
            onChange={e => setDevice(e.target.value)}
          />
          <input
            placeholder="Mount point"
            value={mountpoint}
            onChange={e => setMountpoint(e.target.value)}
          />
          <button onClick={handleMount}>Mount</button>
        </div>
      )}
      {info.mounts.length > 0 && (
        <div>
          <p>Mounted devices in /media:</p>
          <ul>
            {info.mounts.map(m => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    if (res.ok) onLogin(); else alert('Login failed');
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
    const res = await fetch('http://localhost:5000/api/photos', { credentials: 'include' });
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
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: form
    });
    if (res.ok) { setFile(null); fetchPhotos(); }
  };
  return (
    <div>
      <DriveManager />
      <form onSubmit={handleUpload} className="upload">
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <div className="gallery">
        {photos.map(p => (
          <div key={p.id} className="photo">
            <img src={`http://localhost:5000/uploads/${p.filename}`} alt="" />
            <div className="caption">{p.uploader}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [logged, setLogged] = useState(false);
  return (
    <div className="App">
      <h1>Tree Gallery</h1>
      {logged ? <Gallery /> : <Login onLogin={() => setLogged(true)} />}
    </div>
  );
}

export default App;
