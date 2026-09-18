import { login, guardarSesion, estaLogueado } from '../services/auth.js';

// Si ya está logueado, redirigir a inicio
if (estaLogueado()) {
  window.location.href = '../index.html';
}

const form      = document.getElementById('form-login');
const btnLogin  = document.getElementById('btn-login');
const alertaEl  = document.getElementById('alerta-login');
const inputEmail = document.getElementById('input-email');
const inputPass  = document.getElementById('input-password');
const togglePass = document.getElementById('toggle-password');

// ── Mostrar/ocultar contraseña ────────────────────────
togglePass.addEventListener('click', () => {
  const visible = inputPass.type === 'text';
  inputPass.type         = visible ? 'password' : 'text';
  togglePass.textContent = visible ? '👁' : '🙈';
});

// ── Submit ────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  alertaEl.innerHTML = '';

  const email    = inputEmail.value.trim();
  const password = inputPass.value;

  if (!email) {
    mostrarAlerta('El email es obligatorio.'); return;
  }
  if (!password) {
    mostrarAlerta('La contraseña es obligatoria.'); return;
  }

  btnLogin.disabled    = true;
  btnLogin.textContent = 'Ingresando…';

  try {
    const usuario = await login({ email, password });
    guardarSesion(usuario);

    // Redirigir a la página que pidió login, o al inicio
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    window.location.href = redirect ? decodeURIComponent(redirect) : '../index.html';

  } catch (err) {
    const msg = err?.detail || err?.title || 'Email o contraseña incorrectos.';
    mostrarAlerta(msg);
    btnLogin.disabled    = false;
    btnLogin.textContent = 'Ingresar';
  }
});

function mostrarAlerta(msg) {
  alertaEl.innerHTML = `<div class="alerta alerta-error">${msg}</div>`;
}
