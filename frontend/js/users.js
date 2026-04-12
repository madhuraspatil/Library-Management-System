let editingUserId = null;

async function loadUsers() {
  const res = await fetch(`${API}/users`, { headers: authHeaders() });
  const users = await res.json();
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.roll_number}</td>
      <td>${u.department || '-'}</td>
      <td>${u.email}</td>
      <td><button onclick="exportPDF(${u.id},'${u.name}')" 
        style="background:#2563eb">📄 PDF</button></td>
      <td><button onclick="editUser(${u.id},'${u.name}','${u.email}','${u.phone||''}','${u.roll_number}','${u.department||''}')" 
        style="background:#f59e0b">Edit</button></td>
      <td><button onclick="deleteUser(${u.id})">Delete</button></td>
    </tr>`).join('');
}

function editUser(id, name, email, phone, roll, dept) {
  editingUserId = id;
  document.getElementById('name').value = name;
  document.getElementById('email').value = email;
  document.getElementById('phone').value = phone;
  document.getElementById('roll').value = roll;
  document.getElementById('dept').value = dept;
  document.getElementById('userSubmitBtn').textContent = 'Update Student';
  document.getElementById('userCancelBtn').style.display = 'inline-block';
}

function cancelUserEdit() {
  editingUserId = null;
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('roll').value = '';
  document.getElementById('dept').value = '';
  document.getElementById('userSubmitBtn').textContent = 'Add Student';
  document.getElementById('userCancelBtn').style.display = 'none';
}

async function addUser() {
  const body = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    roll_number: document.getElementById('roll').value,
    department: document.getElementById('dept').value
  };

  if (editingUserId) {
    await fetch(`${API}/users/${editingUserId}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(body)
    });
    cancelUserEdit();
  } else {
    await fetch(`${API}/users`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body)
    });
  }
  loadUsers();
}

async function deleteUser(id) {
  if (!confirm('Delete this student?')) return;
  await fetch(`${API}/users/${id}`, { method: 'DELETE', headers: authHeaders() });
  loadUsers();
}

async function exportPDF(id, name) {
  const res = await fetch(`${API}/reports/student/${id}`, { headers: authHeaders() });
  const data = await res.json();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Student History — ${name}`, 20, 20);
  doc.setFontSize(11);
  doc.text(`Roll: ${data.student.roll_number}  |  Dept: ${data.student.department}`, 20, 30);
  let y = 45;
  doc.setFontSize(10);
  doc.text('Book', 20, y);
  doc.text('Issue Date', 90, y);
  doc.text('Due Date', 130, y);
  doc.text('Status', 170, y);
  y += 6;
  data.history.forEach(h => {
    doc.text(h.title.substring(0, 35), 20, y);
    doc.text(h.issue_date?.substring(0,10) || '-', 90, y);
    doc.text(h.due_date?.substring(0,10) || '-', 130, y);
    doc.text(h.status, 170, y);
    if (h.fine > 0) { y += 5; doc.text(`Fine: ₹${h.fine}`, 170, y); }
    y += 7;
    if (y > 270) { doc.addPage(); y = 20; }
  });
  doc.save(`${name}_history.pdf`);
}

loadUsers();