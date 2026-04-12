async function loadReturns() {
  const res = await fetch(`${API}/assign`, { headers: authHeaders() });
  const issues = await res.json();
  document.querySelector('#returnTable tbody').innerHTML = issues.map(i => {
    const overdue = new Date(i.due_date) < new Date();
    return `<tr>
      <td>${i.student_name}</td><td>${i.book_title}</td>
      <td>${i.due_date?.substring(0,10)}</td>
      <td style="color:${overdue?'red':'green'}">${overdue?'OVERDUE':'On Time'}</td>
      <td><button onclick="returnBook(${i.id})">Return</button></td>
    </tr>`;
  }).join('');
}

async function returnBook(id) {
  const res = await fetch(`${API}/returns/${id}`, { method: 'POST', headers: authHeaders() });
  const data = await res.json();
  alert(data.fine > 0 ? `Returned! Fine: ₹${data.fine}` : 'Returned successfully!');
  loadReturns();
}

loadReturns();