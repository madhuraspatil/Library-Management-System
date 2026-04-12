const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const [students] = await db.query('SELECT * FROM students ORDER BY name');
  res.json(students);
});

router.post('/', auth, async (req, res) => {
  const { name, email, phone, roll_number, department } = req.body;
  await db.query(
    'INSERT INTO students (name, email, phone, roll_number, department) VALUES (?,?,?,?,?)',
    [name, email, phone, roll_number, department]
  );
  res.json({ message: 'Student added' });
});

// UPDATE student
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, roll_number, department } = req.body;
  await db.query(
    'UPDATE students SET name=?, email=?, phone=?, roll_number=?, department=? WHERE id=?',
    [name, email, phone, roll_number, department, req.params.id]
  );
  res.json({ message: 'Student updated' });
});

// DELETE student
router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
  res.json({ message: 'Student deleted' });
});

module.exports = router;