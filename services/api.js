/**
 * api.js — Configuración base de la API
 * Si cambia la URL del backend, modificá solo BASE_URL.
 */

// En desarrollo el frontend se sirve desde el mismo backend (puerto 5073),
// por lo que las rutas son relativas. Si usás un servidor separado, cambiá esto.
const BASE_URL = window.location.port === '5073' ? '/api/v1' : 'http://localhost:5073/api/v1';

/**
 * Función base para todos los llamados HTTP.
 * @param {string} method  - GET, POST, PUT, DELETE
 * @param {string} path    - Ruta relativa, ej: '/auctions'
 * @param {object} body    - Cuerpo para POST/PUT (opcional)
 * @returns {Promise<any>} - JSON de respuesta
 */
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('subastaYa_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    // El backend devuelve ProblemDetails en errores
    const error = await response.json().catch(() => ({ title: 'Error desconocido' }));
    throw error;
  }

  // 204 No Content no tiene body
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};
