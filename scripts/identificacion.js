// Si ya está identificado, ir directo al catálogo
if (localStorage.getItem('subastaYa_email')) {
  window.location.href = '../index.html';
}

const form       = document.getElementById('form-identificacion');
const inputEmail = document.getElementById('input-email');
const alertaEl   = document.getElementById('alerta-id');

form.addEventListener('submit', e => {
  e.preventDefault();
  alertaEl.innerHTML = '';

  const email = inputEmail.value.trim();

  if (!email || !email.includes('@')) {
    alertaEl.innerHTML = '<div class="alerta alerta-error">Ingresá un email válido.</div>';
    return;
  }

  localStorage.setItem('subastaYa_email', email);
  window.location.href = '../index.html';
});
