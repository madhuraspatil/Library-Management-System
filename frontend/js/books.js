let editingId = null;

async function loadBooks() {
  const res   = await fetch(`${API}/books`, { headers: authHeaders() });
  const books = await res.json();
  const tbody = document.querySelector('#booksTable tbody');
  document.getElementById('bookCount').textContent = `${books.length} book${books.length!==1?'s':''}`;

  tbody.innerHTML = books.map((b, i) => {
    const avail   = b.available_qty;
    const total   = b.total_qty;
    const pct     = total > 0 ? Math.round((avail/total)*100) : 0;
    const badgeCls = avail === 0 ? 'badge-red' : avail < total/2 ? 'badge-yellow' : 'badge-green';
    const label    = avail === 0 ? '🔴 Unavailable' : avail < total/2 ? '🟡 Low Stock' : '🟢 Available';
    return `<tr>
      <td style="color:var(--text3);font-size:12px;">${i+1}</td>
      <td><strong>${b.title}</strong></td>
      <td style="color:var(--text2);">${b.author}</td>
      <td>${b.category ? `<span class="badge badge-sky">${b.category}</span>` : '<span style="color:var(--text3)">—</span>'}</td>
      <td>
        <span class="badge ${badgeCls}">${label}</span>
        <div style="font-size:11px;color:var(--text3);margin-top:4px;">${avail} of ${total} available</div>
        <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:4px;max-width:80px;">
          <div style="height:100%;width:${pct}%;background:${avail===0?'#f43f5e':avail<total/2?'#f59e0b':'#22c55e'};border-radius:2px;transition:width 0.5s;"></div>
        </div>
      </td>
      <td>
        <button class="btn-edit" onclick="editBook(${b.id},'${esc(b.title)}','${esc(b.author)}','${esc(b.isbn||'')}','${esc(b.category||'')}',${b.total_qty})">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteBook(${b.id})">🗑️ Delete</button>
      </td>
    </tr>`;
  }).join('');
}

function esc(s) { return String(s).replace(/'/g,"\\'"); }

function editBook(id, title, author, isbn, category, qty) {
  editingId = id;
  document.getElementById('title').value    = title;
  document.getElementById('author').value   = author;
  document.getElementById('isbn').value     = isbn;
  document.getElementById('category').value = category;
  document.getElementById('qty').value      = qty;
  document.getElementById('submitBtn').textContent   = '💾 Update Book';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  document.querySelector('.form-box').scrollIntoView({ behavior:'smooth' });
}

function cancelEdit() {
  editingId = null;
  ['title','author','isbn','category'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('qty').value = 1;
  document.getElementById('submitBtn').textContent   = '＋ Add Book';
  document.getElementById('cancelBtn').style.display = 'none';
}

async function addBook() {
  const body = {
    title:     document.getElementById('title').value.trim(),
    author:    document.getElementById('author').value.trim(),
    isbn:      document.getElementById('isbn').value.trim(),
    category:  document.getElementById('category').value.trim(),
    total_qty: +document.getElementById('qty').value
  };
  if (!body.title)  return showToast('Book title is required', 'error');
  if (!body.author) return showToast('Author name is required', 'error');

  if (editingId) {
    const res = await fetch(`${API}/books/${editingId}`, { method:'PUT', headers:authHeaders(), body:JSON.stringify(body) });
    const d   = await res.json();
    showToast('Book updated successfully ✅');
    cancelEdit();
  } else {
    const res = await fetch(`${API}/books`, { method:'POST', headers:authHeaders(), body:JSON.stringify(body) });
    const d   = await res.json();
    showToast('Book added successfully ✅');
    cancelEdit();
  }
  loadBooks();
}

async function deleteBook(id) {
  if (!confirm('Delete this book permanently?')) return;
  await fetch(`${API}/books/${id}`, { method:'DELETE', headers:authHeaders() });
  showToast('Book deleted', 'info');
  loadBooks();
}

loadBooks();
