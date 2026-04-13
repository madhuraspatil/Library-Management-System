async function loadReturns() {
  const res    = await fetch(`${API}/assign`, { headers: authHeaders() });
  const issues = await res.json();

  document.getElementById('returnCount').textContent = `${issues.length} pending`;

  const today    = new Date(); today.setHours(0,0,0,0);
  const overdues = issues.filter(i => new Date(i.due_date) < today).length;
  const onTime   = issues.length - overdues;

  document.getElementById('r_total').textContent   = issues.length;
  document.getElementById('r_overdue').textContent = overdues;
  document.getElementById('r_ontime').textContent  = onTime;

  document.querySelector('#returnTable tbody').innerHTML = issues.map((i, idx) => {
    const due     = new Date(i.due_date); due.setHours(0,0,0,0);
    const diff    = Math.ceil((due - today) / (1000*60*60*24));
    const overdue = diff < 0;
    const daysOverdue = Math.abs(diff);
    const estimatedFine = overdue ? daysOverdue * 2 : 0;

    let statusBadge, daysCell;
    if (overdue) {
      statusBadge = `<span class="badge badge-red">⚠️ Overdue</span>`;
      daysCell    = `<span style="color:#fda4af;font-weight:600;">+${daysOverdue} days overdue</span><br><span style="font-size:11px;color:var(--text3);">Est. fine: ₹${estimatedFine}</span>`;
    } else if (diff === 0) {
      statusBadge = `<span class="badge badge-yellow">⏰ Due Today</span>`;
      daysCell    = `<span style="color:var(--gold2);font-weight:600;">Due today!</span>`;
    } else {
      statusBadge = `<span class="badge badge-green">✅ On Time</span>`;
      daysCell    = `<span style="color:#86efac;">${diff} days remaining</span>`;
    }

    return `<tr>
      <td style="color:var(--text3);font-size:12px;">${idx+1}</td>
      <td><strong>${i.student_name}</strong></td>
      <td>${i.book_title}</td>
      <td style="color:var(--text2);font-size:13px;">${i.issue_date?.substring(0,10)||'—'}</td>
      <td style="color:var(--text2);font-size:13px;">${i.due_date?.substring(0,10)||'—'}</td>
      <td>${daysCell}</td>
      <td>${statusBadge}</td>
      <td>
        <button class="btn-return" onclick="returnBook(${i.id}, ${overdue}, ${estimatedFine})">
          ↩️ Return
        </button>
      </td>
    </tr>`;
  }).join('');
}

async function returnBook(id, wasOverdue, estFine) {
  const msg = wasOverdue
    ? `This book is overdue. Estimated fine: ₹${estFine}. Confirm return?`
    : 'Confirm book return?';
  if (!confirm(msg)) return;

  const res  = await fetch(`${API}/returns/${id}`, { method:'POST', headers:authHeaders() });
  const data = await res.json();
  if (data.fine > 0) {
    showToast(`Book returned! Fine charged: ₹${data.fine} 💰`, 'info');
  } else {
    showToast('Book returned successfully ✅');
  }
  loadReturns();
}

loadReturns();
