const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, uploader TEXT)');
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

function isLoggedIn(req, res, next) {
  if (req.session.user) next(); else res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], function(err) {
    if (err) return res.status(400).json({ error: 'User exists' });
    req.session.user = username;
    res.json({ success: true });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username=?', [username], async (err, row) => {
    if (err || !row || !(await bcrypt.compare(password, row.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    req.session.user = username;
    res.json({ success: true });
  });
});

app.post('/api/upload', isLoggedIn, upload.single('photo'), (req, res) => {
  const user = req.session.user;
  const filename = req.file.filename;
  db.run('INSERT INTO photos (filename, uploader) VALUES (?, ?)', [filename, user], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

app.get('/api/photos', isLoggedIn, (req, res) => {
  db.all('SELECT * FROM photos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
