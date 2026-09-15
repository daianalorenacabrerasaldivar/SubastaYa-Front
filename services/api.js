/**
 * api.js — Configuración base de la API
 * Si cambia la URL del backend, modificá solo BASE_URL.
 */

// Cambiá solo esta línea si cambia el puerto del backend
const BASE_URL = 'http://localhost:5073/api/v1';

/**
 * Función base para todos los llamados HTTP.
 * @param {string} method  - GET, POST, PUT, DELETE
 * @param {string} path    - Ruta relativa, ej: '/auctions'
 * @param {object} body    - Cuerpo para POST/PUT (opcional)
 * @returns {Promise<any>} - JSON de respuesta
 */
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
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
