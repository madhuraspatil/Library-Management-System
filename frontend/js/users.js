let editingUserId = null;

async function loadUsers() {
  const res   = await fetch(`${API}/users`, { headers: authHeaders() });
  const users = await res.json();
  const tbody = document.querySelector('#usersTable tbody');
  document.getElementById('userCount').textContent = `${users.length} student${users.length!==1?'s':''}`;

  tbody.innerHTML = users.map((u, i) => {
    const initials = u.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const colors   = ['#f59e0b','#14b8a6','#a78bfa','#f43f5e','#38bdf8','#22c55e'];
    const color    = colors[i % colors.length];
    return `<tr>
      <td style="color:var(--text3);font-size:12px;">${i+1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:50%;background:${color}22;border:1.5px solid ${color}44;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${color};flex-shrink:0;">${initials}</div>
          <strong>${u.name}</strong>
        </div>
      </td>
      <td><span class="badge badge-sky">${u.roll_number}</span></td>
      <td style="color:var(--text2);">${u.department || '—'}</td>
      <td style="color:var(--text2);font-size:13px;">${u.email}</td>
      <td>
        <button class="btn-pdf" onclick="exportPDF(${u.id},'${esc(u.name)}')">📄 PDF</button>
      </td>
      <td>
        <button class="btn-edit" onclick="editUser(${u.id},'${esc(u.name)}','${esc(u.email)}','${esc(u.phone||'')}','${esc(u.roll_number)}','${esc(u.department||'')}')">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteUser(${u.id})">🗑️ Delete</button>
      </td>
    </tr>`;
  }).join('');
}

function esc(s) { return String(s).replace(/'/g,"\\'"); }

function editUser(id, name, email, phone, roll, dept) {
  editingUserId = id;
  document.getElementById('name').value  = name;
  document.getElementById('email').value = email;
  document.getElementById('phone').value = phone;
  document.getElementById('roll').value  = roll;
  document.getElementById('dept').value  = dept;
  document.getElementById('userSubmitBtn').textContent   = '💾 Update Student';
  document.getElementById('userCancelBtn').style.display = 'inline-block';
  document.querySelector('.form-box').scrollIntoView({ behavior:'smooth' });
}

function cancelUserEdit() {
  editingUserId = null;
  ['name','email','phone','roll','dept'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('userSubmitBtn').textContent   = '＋ Add Student';
  document.getElementById('userCancelBtn').style.display = 'none';
}

async function addUser() {
  const body = {
    name:        document.getElementById('name').value.trim(),
    email:       document.getElementById('email').value.trim(),
    phone:       document.getElementById('phone').value.trim(),
    roll_number: document.getElementById('roll').value.trim(),
    department:  document.getElementById('dept').value.trim()
  };
  if (!body.name)        return showToast('Student name is required', 'error');
  if (!body.roll_number) return showToast('Roll number is required', 'error');
  if (!body.email)       return showToast('Email is required', 'error');

  if (editingUserId) {
    await fetch(`${API}/users/${editingUserId}`, { method:'PUT', headers:authHeaders(), body:JSON.stringify(body) });
    showToast('Student updated successfully ✅');
    cancelUserEdit();
  } else {
    await fetch(`${API}/users`, { method:'POST', headers:authHeaders(), body:JSON.stringify(body) });
    showToast('Student added successfully ✅');
    cancelUserEdit();
  }
  loadUsers();
}

async function deleteUser(id) {
  if (!confirm('Delete this student permanently?')) return;
  await fetch(`${API}/users/${id}`, { method:'DELETE', headers:authHeaders() });
  showToast('Student deleted', 'info');
  loadUsers();
}

async function exportPDF(id, name) {
  showToast('Generating PDF...', 'info');
  try {
    const res  = await fetch(`${API}/reports/student/${id}`, { headers: authHeaders() });
    const data = await res.json();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const W = 210, M = 18;

    // ── Header banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 45, 'F');

    doc.setFillColor(245, 158, 11);
    doc.rect(0, 42, W, 3, 'F');

    // Logo area
    doc.setFontSize(28);
    doc.setTextColor(245, 158, 11);
    doc.text('📚', M, 22);

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('LIBRARY HISTORY', M + 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Student Borrowing Record — LibraryOS Management System', M + 14, 28);

    // Date
    const today = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${today}`, W - M, 38, { align:'right' });

    // ── Student Info Card
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(M, 52, W - M*2, 36, 4, 4, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.roundedRect(M, 52, W - M*2, 36, 4, 4, 'S');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(data.student.name || name, M + 8, 64);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    const s = data.student;
    doc.text(`Roll No: ${s.roll_number || '—'}`, M + 8, 72);
    doc.text(`Dept: ${s.department || '—'}`, M + 8, 79);
    doc.text(`Email: ${s.email || '—'}`, M + 80, 72);
    doc.text(`Phone: ${s.phone || '—'}`, M + 80, 79);

    // ── Summary Stats
    const total    = data.history.length;
    const returned = data.history.filter(h => h.status === 'returned').length;
    const active   = data.history.filter(h => h.status === 'issued').length;
    const totalFine = data.history.reduce((sum, h) => sum + parseFloat(h.fine||0), 0);

    const statsY = 96;
    const sw = (W - M*2) / 4;
    const statData = [
      { label:'Total Borrowed', value: total,   color:[245,158,11] },
      { label:'Returned',       value: returned, color:[34,197,94] },
      { label:'Active Issues',  value: active,   color:[56,189,248] },
      { label:'Total Fine (₹)', value: `₹${totalFine.toFixed(2)}`, color:[244,63,94] }
    ];
    statData.forEach((st, i) => {
      const x = M + i * sw;
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(x, statsY, sw - 3, 22, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...st.color);
      doc.text(String(st.value), x + sw/2 - 1.5, statsY + 10, { align:'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(st.label, x + sw/2 - 1.5, statsY + 17, { align:'center' });
    });

    // ── Table Header
    let y = 128;
    doc.setFillColor(15, 23, 42);
    doc.rect(M, y, W - M*2, 8, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    const cols = [
      { label:'#',          x: M+3,   w:7  },
      { label:'BOOK TITLE', x: M+11,  w:55 },
      { label:'ISSUE DATE', x: M+67,  w:28 },
      { label:'DUE DATE',   x: M+96,  w:28 },
      { label:'RETURN DATE',x: M+125, w:28 },
      { label:'STATUS',     x: M+154, w:20 },
      { label:'FINE (₹)',   x: M+157, w:18 }
    ];
    cols.forEach(c => doc.text(c.label, c.x, y + 5.5));

    y += 10;

    // ── Table Rows
    data.history.forEach((h, i) => {
      if (y > 270) { doc.addPage(); y = 20; }

      // row bg
      if (i % 2 === 0) {
        doc.setFillColor(20, 30, 48);
        doc.rect(M, y - 1, W - M*2, 10, 'F');
      }

      const isOverdue  = h.status === 'overdue' || (h.status === 'issued' && new Date(h.due_date) < new Date());
      const isReturned = h.status === 'returned';

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(String(i+1), M+3, y+5.5);

      // Title (truncate)
      const title = (h.title||'').substring(0, 30) + ((h.title||'').length > 30 ? '…' : '');
      doc.setTextColor(226, 232, 240);
      doc.setFont('helvetica', 'bold');
      doc.text(title, M+11, y+5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(h.issue_date?.substring(0,10)||'—',  M+67,  y+5.5);
      doc.text(h.due_date?.substring(0,10)||'—',    M+96,  y+5.5);
      doc.text(h.return_date?.substring(0,10)||'—', M+125, y+5.5);

      // Status badge
      if (isOverdue) {
        doc.setFillColor(244, 63, 94);
        doc.roundedRect(M+150, y+1, 18, 6, 1.5, 1.5, 'F');
        doc.setTextColor(255,255,255);
        doc.setFontSize(6.5);
        doc.text('OVERDUE', M+151, y+5.3);
      } else if (isReturned) {
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(M+150, y+1, 18, 6, 1.5, 1.5, 'F');
        doc.setTextColor(255,255,255);
        doc.setFontSize(6.5);
        doc.text('RETURNED', M+150.5, y+5.3);
      } else {
        doc.setFillColor(56, 189, 248);
        doc.roundedRect(M+150, y+1, 14, 6, 1.5, 1.5, 'F');
        doc.setTextColor(255,255,255);
        doc.setFontSize(6.5);
        doc.text('ACTIVE', M+151.5, y+5.3);
      }

      // Fine
      const fine = parseFloat(h.fine||0);
      doc.setFontSize(8.5);
      if (fine > 0) {
        doc.setTextColor(244, 63, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${fine.toFixed(2)}`, M+172, y+5.5);
      } else {
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('—', M+172, y+5.5);
      }

      y += 10;
    });

    if (data.history.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(11);
      doc.text('No borrowing history found for this student.', W/2, y+10, { align:'center' });
    }

    // ── Footer
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 285, W, 12, 'F');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('LibraryOS — Confidential Student Record', M, 292);
      doc.text(`Page ${p} of ${pages}`, W - M, 292, { align:'right' });
    }

    doc.save(`${name.replace(/ /g,'_')}_Library_History.pdf`);
    showToast('PDF downloaded successfully ✅');
  } catch(e) {
    console.error(e);
    showToast('Failed to generate PDF', 'error');
  }
}

loadUsers();
