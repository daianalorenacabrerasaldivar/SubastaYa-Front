if (localStorage.getItem('subastaYa_email')) {
  window.location.href = '../index.html';
}

const form          = document.getElementById('form-identificacion');
const inputEmail    = document.getElementById('input-email');
const inputPassword = document.getElementById('input-password');
const alertaEl      = document.getElementById('alerta-id');
const btnEntrar     = document.getElementById('btn-entrar');

form.addEventListener('submit', async e => {
  e.preventDefault();
  alertaEl.innerHTML = '';

  const email    = inputEmail.value.trim();
  const password = inputPassword?.value ?? '';

  if (!email || !email.includes('@')) {
    alertaEl.innerHTML = '<div class="alerta alerta-error">Ingresá un email válido.</div>';
    return;
  }
  if (!password) {
    alertaEl.innerHTML = '<div class="alerta alerta-error">Ingresá tu contraseña.</div>';
    return;
  }

  btnEntrar.disabled    = true;
  btnEntrar.textContent = 'Verificando…';

  try {
    const apiBase = window.location.port === '5073' ? '' : 'http://localhost:5073';
    const res = await fetch(`${apiBase}/api/v1/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
      signal:  AbortSignal.timeout(5000)
    });

    if (!res.ok) throw new Error('credenciales');
    const session = await res.json();

    localStorage.setItem('subastaYa_userId', String(session.usuarioId));
    localStorage.setItem('subastaYa_email',  session.email);
    localStorage.setItem('subastaYa_nombre', session.nombre);
    localStorage.setItem('subastaYa_token',  session.token);
    localStorage.setItem('subastaYa_rol',    session.rol);

    window.location.href = '../index.html';

  } catch (err) {
    const esComunicacion = err.name === 'TimeoutError' || err.name === 'TypeError';
    alertaEl.innerHTML = esComunicacion
      ? '<div class="alerta alerta-error">No se pudo conectar con el servidor.</div>'
      : '<div class="alerta alerta-error">Email o contraseña incorrectos.</div>';
    btnEntrar.disabled    = false;
    btnEntrar.textContent = 'Ingresar →';
  }
});
