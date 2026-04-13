const API = 'http://localhost:5000/api';

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type]||'✅'}</span> ${message}`;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

async function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const err      = document.getElementById('error');
  if (!email || !password) {
    err.style.display = 'block';
    err.textContent = '⚠️ Please fill in both fields';
    return;
  }
  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminName', data.name);
      window.location.href = 'dashboard.html';
    } else {
      err.style.display = 'block';
      err.textContent = '❌ ' + data.message;
    }
  } catch (e) {
    err.style.display = 'block';
    err.textContent = '🔌 Cannot connect to server. Is backend running on port 5000?';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

function getToken() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return null; }
  return token;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}
