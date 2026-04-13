async function loadSelects() {
  const [bRes, sRes] = await Promise.all([
    fetch(`${API}/books`, { headers: authHeaders() }),
    fetch(`${API}/users`, { headers: authHeaders() })
  ]);
  const books    = await bRes.json();
  const students = await sRes.json();

  document.getElementById('bookSelect').innerHTML =
    '<option value="">📚 Select Book</option>' +
    books.filter(b => b.available_qty > 0)
         .map(b => `<option value="${b.id}">${b.title} — ${b.available_qty} left</option>`).join('');

  document.getElementById('studentSelect').innerHTML =
    '<option value="">🎓 Select Student</option>' +
    students.map(s => `<option value="${s.id}">${s.name} (${s.roll_number})</option>`).join('');
}

async function loadIssues() {
  const res    = await fetch(`${API}/assign`, { headers: authHeaders() });
  const issues = await res.json();
  document.getElementById('issueCount').textContent = `${issues.length} active`;

  document.querySelector('#issueTable tbody').innerHTML = issues.map((i, idx) => {
    const today   = new Date(); today.setHours(0,0,0,0);
    const due     = new Date(i.due_date); due.setHours(0,0,0,0);
    const diff    = Math.ceil((due - today) / (1000*60*60*24));
    const overdue = diff < 0;
    const badge   = overdue
      ? `<span class="badge badge-red">⚠️ Overdue ${Math.abs(diff)}d</span>`
      : diff === 0
        ? `<span class="badge badge-yellow">⏰ Due Today</span>`
        : `<span class="badge badge-green">✅ ${diff}d left</span>`;
    return `<tr>
      <td style="color:var(--text3);font-size:12px;">${idx+1}</td>
      <td><strong>${i.student_name}</strong></td>
      <td><span class="badge badge-sky">${i.roll_number}</span></td>
      <td>${i.book_title}</td>
      <td style="color:var(--text2);font-size:13px;">${i.issue_date?.substring(0,10)}</td>
      <td style="color:var(--text2);font-size:13px;">${i.due_date?.substring(0,10)}</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
}

async function assignBook() {
  const body = {
    book_id:    document.getElementById('bookSelect').value,
    student_id: document.getElementById('studentSelect').value,
    due_date:   document.getElementById('dueDate').value
  };
  if (!body.book_id)    return showToast('Please select a book', 'error');
  if (!body.student_id) return showToast('Please select a student', 'error');
  if (!body.due_date)   return showToast('Please set a due date', 'error');

  const res  = await fetch(`${API}/assign`, { method:'POST', headers:authHeaders(), body:JSON.stringify(body) });
  const data = await res.json();
  if (res.ok) {
    showToast('Book issued successfully ✅');
    document.getElementById('bookSelect').value    = '';
    document.getElementById('studentSelect').value = '';
    document.getElementById('dueDate').value       = '';
    loadSelects();
    loadIssues();
  } else {
    showToast(data.message || 'Error issuing book', 'error');
  }
}

loadSelects();
loadIssues();
