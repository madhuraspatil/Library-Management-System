const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email, password); // ADD THIS LINE
  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (!rows.length) return res.status(400).json({ message: 'Admin not found' });
    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) return res.status(400).json({ message: 'Wrong password' });
    const token = jwt.sign({ id: rows[0].id, email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, name: rows[0].name });
  } catch (err) {
    console.log('DB Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;