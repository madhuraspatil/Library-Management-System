const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const [issues] = await db.query(`
    SELECT i.*, b.title AS book_title, s.name AS student_name, s.roll_number
    FROM issues i
    JOIN books b ON i.book_id = b.id
    JOIN students s ON i.student_id = s.id
    WHERE i.status = 'issued'
    ORDER BY i.issue_date DESC
  `);
  res.json(issues);
});

router.post('/', auth, async (req, res) => {
  const { book_id, student_id, due_date } = req.body;
  const [book] = await db.query('SELECT available_qty FROM books WHERE id = ?', [book_id]);
  if (!book[0] || book[0].available_qty < 1)
    return res.status(400).json({ message: 'Book not available' });
  await db.query(
    'INSERT INTO issues (book_id, student_id, due_date) VALUES (?,?,?)',
    [book_id, student_id, due_date]
  );
  await db.query('UPDATE books SET available_qty = available_qty - 1 WHERE id = ?', [book_id]);
  res.json({ message: 'Book issued successfully' });
});

module.exports = router;