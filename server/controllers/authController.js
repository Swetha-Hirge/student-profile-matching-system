const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,                    // set true only when behind HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
};

exports.register = async (req, res) => {
  try {
    const { name, username: rawUsername, email, password, role } = req.body;
    const username = (rawUsername || name || '').trim();

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const allowedRoles = ['student', 'teacher', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed,
      role,
    });

    res.status(201).json({
      message: 'User registered',
      user: { id: user.id, username: user.username, role: user.role, email: user.email },
    });
  } catch (err) {
    console.error('[auth.register]', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase();
    const { password } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOpts); // httpOnly cookie

    res.json({
      message: 'Logged in',
      token, // optional (for Bearer flow)
      user: { id: user.id, username: user.username, role: user.role, email: user.email },
    });
  } catch (err) {
    console.error('[auth.login]', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

exports.me = async (req, res) => {
  // req.user set by verifyToken
  res.json({ user: req.user });
};

exports.logout = async (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
  res.json({ message: 'Logged out' });
};
