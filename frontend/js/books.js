let editingId = null;

async function loadBooks() {
  const res = await fetch(`${API}/books`, { headers: authHeaders() });
  const books = await res.json();
  const tbody = document.querySelector('#booksTable tbody');
  tbody.innerHTML = books.map(b => `
    <tr>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.category || '-'}</td>
      <td>${b.available_qty}/${b.total_qty}</td>
      <td>
        <button onclick="editBook(${b.id},'${b.title}','${b.author}','${b.isbn||''}','${b.category||''}',${b.total_qty})" 
          style="background:#f59e0b">Edit</button>
        <button onclick="deleteBook(${b.id})">Delete</button>
      </td>
    </tr>`).join('');
}

function editBook(id, title, author, isbn, category, qty) {
  editingId = id;
  document.getElementById('title').value = title;
  document.getElementById('author').value = author;
  document.getElementById('isbn').value = isbn;
  document.getElementById('category').value = category;
  document.getElementById('qty').value = qty;
  document.getElementById('submitBtn').textContent = 'Update Book';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

function cancelEdit() {
  editingId = null;
  document.getElementById('title').value = '';
  document.getElementById('author').value = '';
  document.getElementById('isbn').value = '';
  document.getElementById('category').value = '';
  document.getElementById('qty').value = 1;
  document.getElementById('submitBtn').textContent = 'Add Book';
  document.getElementById('cancelBtn').style.display = 'none';
}

async function addBook() {
  const body = {
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    isbn: document.getElementById('isbn').value,
    category: document.getElementById('category').value,
    total_qty: +document.getElementById('qty').value
  };

  if (editingId) {
    await fetch(`${API}/books/${editingId}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(body)
    });
    cancelEdit();
  } else {
    await fetch(`${API}/books`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body)
    });
  }
  loadBooks();
}

async function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  await fetch(`${API}/books/${id}`, { method: 'DELETE', headers: authHeaders() });
  loadBooks();
}

loadBooks();