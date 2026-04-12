const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const [books] = await db.query('SELECT * FROM books ORDER BY title');
  res.json(books);
});

router.post('/', auth, async (req, res) => {
  const { title, author, isbn, category, total_qty } = req.body;
  await db.query(
    'INSERT INTO books (title, author, isbn, category, total_qty, available_qty) VALUES (?,?,?,?,?,?)',
    [title, author, isbn, category, total_qty, total_qty]
  );
  res.json({ message: 'Book added' });
});

router.put('/:id', auth, async (req, res) => {
  const { title, author, isbn, category, total_qty } = req.body;
  await db.query(
    'UPDATE books SET title=?, author=?, isbn=?, category=?, total_qty=? WHERE id=?',
    [title, author, isbn, category, total_qty, req.params.id]
  );
  res.json({ message: 'Book updated' });
});

router.delete('/:id', auth, async (req, res) => {
  await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
  res.json({ message: 'Book deleted' });
});

module.exports = router;