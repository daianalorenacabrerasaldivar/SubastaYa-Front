import { api } from './api.js';

/**
 * Deposita saldo ficticio en la billetera del usuario.
 * @param {object} data - { usuarioId, monto }
 */
export function deposit(data) {
  return api.post('/wallet/deposit', data);
}

/**
 * Obtiene el saldo de la billetera del usuario.
 * @param {number} usuarioId
 */
export function getBalance(usuarioId) {
  return api.get(`/wallet/balance?usuarioId=${usuarioId}`);
}

/**
 * Obtiene el historial de transacciones del usuario.
 * @param {number} usuarioId
 */
export function getTransactions(usuarioId) {
  return api.get(`/wallet/transactions?usuarioId=${usuarioId}`);
}
