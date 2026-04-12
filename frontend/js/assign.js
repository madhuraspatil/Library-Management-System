async function loadSelects() {
  const [booksRes, studentsRes] = await Promise.all([
    fetch(`${API}/books`, { headers: authHeaders() }),
    fetch(`${API}/users`, { headers: authHeaders() })
  ]);
  const books = await booksRes.json();
  const students = await studentsRes.json();

  document.getElementById('bookSelect').innerHTML =
    '<option value="">Select Book</option>' +
    books.filter(b => b.available_qty > 0)
         .map(b => `<option value="${b.id}">${b.title} (${b.available_qty} left)</option>`).join('');

  document.getElementById('studentSelect').innerHTML =
    '<option value="">Select Student</option>' +
    students.map(s => `<option value="${s.id}">${s.name} — ${s.roll_number}</option>`).join('');
}

async function loadIssues() {
  const res = await fetch(`${API}/assign`, { headers: authHeaders() });
  const issues = await res.json();
  document.querySelector('#issueTable tbody').innerHTML = issues.map(i => `
    <tr>
      <td>${i.student_name}</td><td>${i.roll_number}</td>
      <td>${i.book_title}</td>
      <td>${i.issue_date?.substring(0,10)}</td>
      <td>${i.due_date?.substring(0,10)}</td>
    </tr>`).join('');
}

async function assignBook() {
  const body = {
    book_id: document.getElementById('bookSelect').value,
    student_id: document.getElementById('studentSelect').value,
    due_date: document.getElementById('dueDate').value
  };
  if (!body.book_id || !body.student_id || !body.due_date)
    return alert('Fill all fields');
  const res = await fetch(`${API}/assign`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  alert(data.message);
  loadSelects(); loadIssues();
}

loadSelects(); loadIssues();