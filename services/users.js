import { api } from './api.js';

/**
 * Obtiene las subastas publicadas por un vendedor.
 * @param {number} vendedorId
 */
export function getAuctionsByVendedor(vendedorId) {
  return api.get(`/users/${vendedorId}/auctions`);
}

/**
 * Obtiene las pujas realizadas por un comprador.
 * @param {number} compradorId
 */
export function getBidsByComprador(compradorId) {
  return api.get(`/users/${compradorId}/bids`);
}
