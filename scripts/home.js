import { getAuctions } from '../services/auctions.js';

// ── Estado de la página ───────────────────────────────
let filtroStatus = '';
let sortBy = 'TiempoRestante';
let serverOffset = 0; // diferencia entre reloj del server y del cliente (ms)
let timerInterval = null;
let subastasActuales = [];

// ── Inicio ────────────────────────────────────────────
cargarSubastas();
configurarFiltros();

// ── Carga de subastas ─────────────────────────────────
async function cargarSubastas() {
  const grid  = document.getElementById('auctions-grid');
  const estado = document.getElementById('estado-carga');

  estado.hidden = false;
  estado.innerHTML = '<div class="spinner"></div>';
  grid.innerHTML = '';

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  try {
    const data = await getAuctions({ status: filtroStatus, sortBy });

    // Sincronizar reloj con el servidor
    serverOffset = new Date(data.fechaServidor) - new Date();
    subastasActuales = data.items;

    estado.hidden = true;

    if (data.items.length === 0) {
      grid.innerHTML = `
        <div class="estado-vacio">
          <span style="font-size:40px">🔍</span>
          <p>No hay subastas en esta categoría.</p>
        </div>`;
      return;
    }

    renderSubastas(data.items);

    // Actualizar timers cada segundo solo si hay subastas activas
    const hayActivas = data.items.some(s => s.estado === 'ACTIVA');
    if (hayActivas) {
      timerInterval = setInterval(() => actualizarTimers(), 1000);
    }

  } catch (err) {
    estado.hidden = false;
    estado.innerHTML = `
      <div class="estado-vacio">
        <span style="font-size:40px">⚠️</span>
        <p>No se pudo conectar con el servidor.</p>
        <p style="font-size:13px;margin-top:4px">¿Está corriendo el backend en el puerto 5073?</p>
        <button class="btn btn-secondary btn-sm" style="margin-top:16px" onclick="location.reload()">
          Reintentar
        </button>
      </div>`;
  }
}

// ── Render de cards ───────────────────────────────────
function renderSubastas(items) {
  const grid = document.getElementById('auctions-grid');

  grid.innerHTML = items.map(s => `
    <article class="auction-card" onclick="irADetalle(${s.id})" tabindex="0"
             onkeydown="if(event.key==='Enter') irADetalle(${s.id})">

      <div class="auction-card__img-wrap">
        <img
          src="${s.urlImagen || ''}"
          alt="${s.titulo}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
          loading="lazy">
        <div class="img-fallback" style="display:none; align-items:center; justify-content:center; height:100%; font-size:40px;">🏷️</div>
        <span class="auction-card__badge badge-${s.estado.toLowerCase()}">${estadoLabel(s.estado)}</span>
      </div>

      <div class="auction-card__body">
        <p class="auction-card__categoria">${s.categoriaNombre}</p>
        <h2 class="auction-card__titulo">${s.titulo}</h2>

        <div class="auction-card__precios">
          <div>
            <p class="auction-card__label">Oferta actual</p>
            <p class="auction-card__monto ${s.ofertaMasAlta ? '' : 'sin-ofertas'}">
              ${s.ofertaMasAlta ? formatMoney(s.ofertaMasAlta) : 'Sin ofertas'}
            </p>
          </div>
          <div>
            <p class="auction-card__label">Pujas</p>
            <p class="auction-card__monto">${s.cantidadOfertas}</p>
          </div>
        </div>

        ${s.estado === 'ACTIVA' ? `
          <div class="auction-card__timer">
            <span>⏱</span>
            <span class="timer-valor" id="timer-${s.id}" data-fin="${s.fechaFin}">--:--:--</span>
          </div>
        ` : `
          <p class="auction-card__fecha">${fechaLabel(s)}</p>
        `}

        <div class="auction-card__footer">
          <button class="btn btn-primary btn-sm btn-full">Ver subasta →</button>
        </div>
      </div>

    </article>
  `).join('');

  // Primer tick de timers inmediato
  actualizarTimers();
}

// ── Timers ────────────────────────────────────────────
function actualizarTimers() {
  subastasActuales
    .filter(s => s.estado === 'ACTIVA')
    .forEach(s => {
      const el = document.getElementById(`timer-${s.id}`);
      if (!el) return;

      const ahora = Date.now() + serverOffset;
      const fin   = new Date(s.fechaFin).getTime();
      const diff  = fin - ahora;

      if (diff <= 0) {
        el.textContent = 'Finalizado';
        el.classList.add('urgente');
        return;
      }

      el.textContent = formatTiempo(diff);
      // Rojo si quedan menos de 5 minutos
      el.classList.toggle('urgente', diff < 5 * 60 * 1000);
    });
}

// ── Filtros ───────────────────────────────────────────
function configurarFiltros() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroStatus = btn.dataset.status;
      cargarSubastas();
    });
  });

  document.getElementById('sort-select').addEventListener('change', e => {
    sortBy = e.target.value;
    cargarSubastas();
  });
}

// ── Navegación ────────────────────────────────────────
window.irADetalle = function (id) {
  window.location.href = `./pages/auction-detail.html?id=${id}`;
};

// ── Helpers de formato ────────────────────────────────
function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatTiempo(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function estadoLabel(estado) {
  const labels = { ACTIVA: 'Activa', PROGRAMADA: 'Próxima', FINALIZADA: 'Finalizada', DESIERTA: 'Desierta' };
  return labels[estado] ?? estado;
}

function fechaLabel(s) {
  if (s.estado === 'PROGRAMADA') return `Inicia: ${formatFecha(s.fechaInicio)}`;
  if (s.estado === 'FINALIZADA') return `Finalizó: ${formatFecha(s.fechaFin)}`;
  if (s.estado === 'DESIERTA')   return `Sin ofertas · ${formatFecha(s.fechaFin)}`;
  return '';
}

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
