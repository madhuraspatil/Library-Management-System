const API = 'http://localhost:5000/api';

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log('Sending:', email, password);

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('Response:', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminName', data.name);
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('error').style.display = 'block';
      document.getElementById('error').textContent = data.message;
    }
  } catch (err) {
    console.log('Fetch error:', err);
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = 'Cannot connect to server';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

function getToken() {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = 'login.html';
  return token;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}