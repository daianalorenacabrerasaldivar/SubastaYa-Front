// Si ya está identificado, ir directo al catálogo
if (localStorage.getItem('subastaYa_email')) {
  window.location.href = '../index.html';
}

const form      = document.getElementById('form-identificacion');
const inputEmail = document.getElementById('input-email');
const inputId    = document.getElementById('input-id');
const btnEntrar  = document.getElementById('btn-entrar');
const alertaEl   = document.getElementById('alerta-id');

form.addEventListener('submit', e => {
  e.preventDefault();
  alertaEl.innerHTML = '';

  const email = inputEmail.value.trim();
  const id    = Number(inputId.value);

  if (!email || !email.includes('@')) {
    alertaEl.innerHTML = '<div class="alerta alerta-error">Ingresá un email válido.</div>';
    return;
  }
  if (!id || id <= 0) {
    alertaEl.innerHTML = '<div class="alerta alerta-error">Ingresá tu número de usuario.</div>';
    return;
  }

  localStorage.setItem('subastaYa_email',  email);
  localStorage.setItem('subastaYa_userId', String(id));

  window.location.href = '../index.html';
});
