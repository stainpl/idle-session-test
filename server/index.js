// index.js
import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';
const { hash, compare } = bcrypt;
import cors from 'cors';
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import { fileURLToPath } from 'url';

// recreate __filename / __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_FILE = join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'yyhIYfrsdrd69iFsesdcjFrwPPlnbjbas86AgNyRcPOhQWvk7';
const JWT_EXPIRES = '1h';
const BCRYPT_SALT_ROUNDS = 10;

const app = express();
app.use(cors());
app.use(express.json()); // use express.json() middleware

function readUsers() {
  try {
    const raw = readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}
function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashed = await hash(password, BCRYPT_SALT_ROUNDS);
  const id = Date.now().toString();
  const user = { id, email, passwordHash: hashed, createdAt: new Date().toISOString() };
  users.push(user);
  writeUsers(users);

  res.status(201).json({ message: 'User registered', user: { id, email } });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Protected profile
function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
app.get('/api/profile', authenticateJWT, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email });
});

// Ensure demo user exists on startup
async function ensureDemoUser() {
  const demoEmail = 'demo@demo.com';
  const demoPassword = 'demo';
  const users = readUsers();
  const exists = users.some(u => u.email.toLowerCase() === demoEmail.toLowerCase());
  if (exists) {
    console.log('Demo user already exists.');
    return;
  }
  console.log('Creating demo user...');
  const hashed = await hash(demoPassword, BCRYPT_SALT_ROUNDS);
  const id = Date.now().toString();
  users.push({ id, email: demoEmail, passwordHash: hashed, createdAt: new Date().toISOString() });
  writeUsers(users);
  console.log(`Demo user created: ${demoEmail} / ${demoPassword}`);
}

// Start server
(async () => {
  try {
    await ensureDemoUser();
  } catch (err) {
    console.error('ensureDemoUser failed', err);
  }
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));
})();
