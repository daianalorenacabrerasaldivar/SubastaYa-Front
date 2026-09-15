import { api } from './api.js';

/**
 * Registra una puja en una subasta.
 * @param {number} auctionId
 * @param {object} data - { compradorId, monto }
 */
export function placeBid(auctionId, data) {
  return api.post(`/auctions/${auctionId}/bids`, data);
}

/**
 * Obtiene el historial de pujas de una subasta.
 * @param {number} auctionId
 */
export function getBids(auctionId) {
  return api.get(`/auctions/${auctionId}/bids`);
}
