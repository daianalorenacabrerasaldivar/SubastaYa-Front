import { api } from './api.js';

/**
 * Inicia sesión con email y contraseña.
 * @param {object} data - { email, password }
 * @returns {{ id, nombre, email, token? }}
 */
export function login(data) {
  return api.post('/auth/login', data);
}

/**
 * Cierra sesión (invalida el token en el backend si aplica).
 */
export function logout() {
  return api.post('/auth/logout', {});
}

// ── Helpers de sesión (localStorage) ─────────────────
export function guardarSesion(usuario) {
  localStorage.setItem('subastaYa_userId',    String(usuario.id));
  localStorage.setItem('subastaYa_nombre',    usuario.nombre ?? '');
  localStorage.setItem('subastaYa_email',     usuario.email  ?? '');
  if (usuario.token) {
    localStorage.setItem('subastaYa_token', usuario.token);
  }
}

export function obtenerSesion() {
  const id = localStorage.getItem('subastaYa_userId');
  if (!id) return null;
  return {
    id:     Number(id),
    nombre: localStorage.getItem('subastaYa_nombre') ?? '',
    email:  localStorage.getItem('subastaYa_email')  ?? '',
    token:  localStorage.getItem('subastaYa_token')  ?? '',
  };
}

export function cerrarSesion() {
  ['subastaYa_userId', 'subastaYa_nombre', 'subastaYa_email', 'subastaYa_token']
    .forEach(k => localStorage.removeItem(k));
}

export function estaLogueado() {
  return !!localStorage.getItem('subastaYa_userId');
}
