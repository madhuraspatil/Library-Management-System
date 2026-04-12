const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/student/:id', auth, async (req, res) => {
  const [history] = await db.query(`
    SELECT i.issue_date, i.due_date, i.return_date, i.status,
           b.title, b.author,
           COALESCE(f.amount, 0) AS fine, f.paid
    FROM issues i
    JOIN books b ON i.book_id = b.id
    LEFT JOIN fines f ON f.issue_id = i.id
    WHERE i.student_id = ?
    ORDER BY i.issue_date DESC
  `, [req.params.id]);
  
  const [student] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
  res.json({ student: student[0], history });
});

router.get('/dashboard', auth, async (req, res) => {
  const [[{ totalBooks }]] = await db.query('SELECT COUNT(*) AS totalBooks FROM books');
  const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) AS totalStudents FROM students');
  const [[{ activeIssues }]] = await db.query("SELECT COUNT(*) AS activeIssues FROM issues WHERE status='issued'");
  const [[{ totalFines }]] = await db.query('SELECT COALESCE(SUM(amount),0) AS totalFines FROM fines WHERE paid=0');
  res.json({ totalBooks, totalStudents, activeIssues, totalFines });
});

module.exports = router;