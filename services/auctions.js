import { api } from './api.js';

/**
 * Obtiene la lista de subastas con filtros y paginación.
 * @param {object} params - { status, categoryId, minPrice, maxPrice, sortBy, page, pageSize }
 */
export function getAuctions(params = {}) {
  const query = new URLSearchParams();
  if (params.status)     query.set('status',     params.status);
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.minPrice)   query.set('minPrice',   params.minPrice);
  if (params.maxPrice)   query.set('maxPrice',   params.maxPrice);
  if (params.sortBy)     query.set('sortBy',     params.sortBy);
  if (params.page)       query.set('page',       params.page);
  if (params.pageSize)   query.set('pageSize',   params.pageSize);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return api.get(`/auctions${qs}`);
}

/**
 * Obtiene el detalle completo de una subasta.
 * @param {number} id
 */
export function getAuction(id) {
  return api.get(`/auctions/${id}`);
}

/**
 * Crea una nueva subasta.
 * @param {object} data - { vendedorId, categoriaId, titulo, descripcion, urlImagen, precioBase, incrementoMinimo, fechaInicio, fechaFin }
 */
export function createAuction(data) {
  return api.post('/auctions', data);
}
