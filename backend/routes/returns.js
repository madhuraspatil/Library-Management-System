const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.post('/:id', auth, async (req, res) => {
  const issueId = req.params.id;
  const today = new Date().toISOString().split('T')[0];

  const [issue] = await db.query('SELECT * FROM issues WHERE id = ?', [issueId]);
  if (!issue[0]) return res.status(404).json({ message: 'Issue not found' });

  const due = new Date(issue[0].due_date);
  const ret = new Date(today);
  const diffDays = Math.max(0, Math.ceil((ret - due) / (1000 * 60 * 60 * 24)));
  const fine = diffDays * 2; // Rs. 2 per day

  await db.query(
    "UPDATE issues SET return_date=?, status='returned' WHERE id=?",
    [today, issueId]
  );
  await db.query(
    'UPDATE books SET available_qty = available_qty + 1 WHERE id = ?',
    [issue[0].book_id]
  );
  if (fine > 0) {
    await db.query('INSERT INTO fines (issue_id, amount) VALUES (?,?)', [issueId, fine]);
  }
  res.json({ message: 'Book returned', fine });
});

module.exports = router;