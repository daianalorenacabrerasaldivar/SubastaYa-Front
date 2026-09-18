if (localStorage.getItem('subastaYa_email')) {
  window.location.href = '../index.html';
}

const form       = document.getElementById('form-identificacion');
const inputEmail = document.getElementById('input-email');
const alertaEl   = document.getElementById('alerta-id');
const btnEntrar  = document.getElementById('btn-entrar');

form.addEventListener('submit', async e => {
  e.preventDefault();
  alertaEl.innerHTML = '';

  const email = inputEmail.value.trim();
  if (!email || !email.includes('@')) {
    alertaEl.innerHTML = '<div class="alerta alerta-error">Ingresá un email válido.</div>';
    return;
  }

  btnEntrar.disabled    = true;
  btnEntrar.textContent = 'Verificando…';

  try {
    const res = await fetch(
      `http://localhost:5073/api/v1/users?email=${encodeURIComponent(email)}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) throw new Error('not_found');
    const usuario = await res.json();

    const u = Array.isArray(usuario) ? usuario[0] : usuario;
    if (!u) throw new Error('not_found');

    localStorage.setItem('subastaYa_email',  u.email ?? email);
    localStorage.setItem('subastaYa_userId', String(u.id));

    window.location.href = '../index.html';

  } catch (err) {
    const esComunicacion = err.name === 'TimeoutError' || err.name === 'TypeError';
    alertaEl.innerHTML = esComunicacion
      ? '<div class="alerta alerta-error">No se pudo conectar con el servidor.</div>'
      : '<div class="alerta alerta-error">No encontramos un usuario con ese email.</div>';
    btnEntrar.disabled    = false;
    btnEntrar.textContent = 'Ingresar →';
  }
});
