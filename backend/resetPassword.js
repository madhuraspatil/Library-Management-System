const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function reset() {
  const hash = await bcrypt.hash('admin123', 10);
  await db.query('UPDATE admins SET password = ? WHERE email = ?', 
    [hash, 'admin@library.com']);
  console.log('Password reset to admin123 ');
  process.exit();
}
reset();