import { getAuctionsByVendedor, getBidsByComprador } from '../services/users.js';

// ── Sesión ────────────────────────────────────────────
const usuarioId = Number(localStorage.getItem('subastaYa_userId'));
const rol       = localStorage.getItem('subastaYa_rol') ?? '';
const esVendedor = rol.toLowerCase() === 'vendedor';

// ── Elementos ─────────────────────────────────────────
const alertaCarga      = document.getElementById('alerta-carga');
const panelActividades = document.getElementById('panel-actividades');
const estadoCarga      = document.getElementById('estado-carga-actividades');

// ── Carga automática ──────────────────────────────────
cargarActividades();

async function cargarActividades() {
  if (!usuarioId) {
    if (estadoCarga) estadoCarga.hidden = true;
    alertaCarga.innerHTML =
      '<div class="alerta alerta-error">No hay sesión activa. <a href="../index.html">Ingresar</a></div>';
    return;
  }

  try {
    const [publicadas, pujas] = await Promise.allSettled([
      getAuctionsByVendedor(usuarioId),
      getBidsByComprador(usuarioId),
    ]);

    const subastasPublicadas = resolverResult(publicadas, []);
    const pujasData          = resolverResult(pujas, []);

    renderStats(subastasPublicadas, pujasData);
    renderPublicadas(subastasPublicadas);
    renderPujas(pujasData);
    renderGanadas(pujasData);

    // Tab por defecto según rol
    if (!esVendedor) activarTab('tab-pujas');

    if (estadoCarga) estadoCarga.hidden = true;
    panelActividades.hidden = false;

  } catch (err) {
    if (estadoCarga) estadoCarga.hidden = true;
    alertaCarga.innerHTML =
      '<div class="alerta alerta-error">No se pudieron cargar las actividades.</div>';
  }
}

function resolverResult(settled, fallback) {
  return settled.status === 'fulfilled'
    ? (settled.value?.items ?? settled.value ?? fallback)
    : fallback;
}

// ── Estadísticas rápidas ──────────────────────────────
function renderStats(publicadas, pujas) {
  const activas = publicadas.filter(s => s.estado === 'ACTIVA').length;
  const ganadas = pujas.filter(p => p.esGanador).length;

  document.getElementById('stat-publicadas').textContent = publicadas.length;
  document.getElementById('stat-activas').textContent    = activas;
  document.getElementById('stat-pujas').textContent      = pujas.length;
  document.getElementById('stat-ganadas').textContent    = ganadas;

  setTabCount('tab-publicadas', publicadas.length);
  setTabCount('tab-pujas',      pujas.length);
  setTabCount('tab-ganadas',    ganadas);
}

function setTabCount(id, n) {
  const el = document.getElementById(id)?.querySelector('.tab-count');
  if (el) el.textContent = n;
}

// ── Tab: Mis publicaciones ────────────────────────────
function renderPublicadas(subastas) {
  const lista = document.getElementById('lista-publicadas');
  if (!subastas.length) {
    lista.innerHTML = `
      <div class="actividad-vacia">
        <span>📦</span>
        <p>Todavía no publicaste ninguna subasta.</p>
        ${esVendedor ? `<a href="create-auction.html" class="btn btn-primary btn-sm" style="margin-top:12px">+ Publicar subasta</a>` : ''}
      </div>`;
    return;
  }
  lista.innerHTML = subastas.map(s => `
    <div class="actividad-card">
      <div class="actividad-img">
        ${s.urlImagen
          ? `<img src="${s.urlImagen}" alt="${s.titulo}" onerror="this.parentElement.textContent='🏷️'">`
          : '🏷️'}
      </div>
      <div class="actividad-info">
        <p class="actividad-titulo">${s.titulo}</p>
        <div class="actividad-meta">
          <span class="badge badge-${s.estado.toLowerCase()}">${estadoLabel(s.estado)}</span>
          <span>${s.cantidadOfertas} puja${s.cantidadOfertas !== 1 ? 's' : ''}</span>
          <span>${fechaLabel(s)}</span>
        </div>
      </div>
      <div class="actividad-monto">${s.ofertaMasAlta ? formatMoney(s.ofertaMasAlta) : formatMoney(s.precioBase)}</div>
      <div class="actividad-acciones">
        <a href="auction-detail.html?id=${s.id}" class="btn btn-secondary btn-sm">Ver →</a>
      </div>
    </div>
  `).join('');
}

// ── Tab: Mis pujas ────────────────────────────────────
function renderPujas(pujas) {
  const lista = document.getElementById('lista-pujas');
  if (!pujas.length) {
    lista.innerHTML = `
      <div class="actividad-vacia">
        <span>🎯</span>
        <p>Todavía no realizaste ninguna puja.</p>
        <a href="../index.html" class="btn btn-primary btn-sm" style="margin-top:12px">
          Ver subastas activas
        </a>
      </div>`;
    return;
  }
  lista.innerHTML = pujas.map(p => {
    const esGanando = p.esGanador;
    const enCurso   = p.estadoSubasta === 'ACTIVA';

    return `
      <div class="actividad-card">
        <div class="actividad-img">
          ${p.urlImagen
            ? `<img src="${p.urlImagen}" alt="${p.tituloSubasta}" onerror="this.parentElement.textContent='🏷️'">`
            : '🏷️'}
        </div>
        <div class="actividad-info">
          <p class="actividad-titulo">${p.tituloSubasta || 'Subasta #' + p.subastaId}</p>
          <div class="actividad-meta">
            <span class="badge badge-${(p.estadoSubasta || '').toLowerCase()}">${estadoLabel(p.estadoSubasta)}</span>
            <span>Mi puja: ${formatMoney(p.miMejorPuja)}</span>
            ${enCurso ? `<span style="color:var(--color-${esGanando ? 'success' : 'error'})">
              ${esGanando ? '✓ Ganando' : '↑ Superado'}
            </span>` : ''}
          </div>
        </div>
        <div class="actividad-monto ${enCurso ? (esGanando ? 'ganando' : 'perdiendo') : (esGanando ? 'ganada' : '')}">
          ${formatMoney(p.ofertaMasAlta ?? p.miMejorPuja)}
        </div>
        <div class="actividad-acciones">
          <a href="auction-detail.html?id=${p.subastaId}" class="btn btn-secondary btn-sm">Ver →</a>
        </div>
      </div>`;
  }).join('');
}

// ── Tab: Ganadas ──────────────────────────────────────
function renderGanadas(pujas) {
  const ganadas = pujas.filter(p => p.esGanador);
  const lista   = document.getElementById('lista-ganadas');
  if (!ganadas.length) {
    lista.innerHTML = `
      <div class="actividad-vacia">
        <span>🏆</span>
        <p>Todavía no ganaste ninguna subasta.</p>
        <a href="../index.html" class="btn btn-primary btn-sm" style="margin-top:12px">
          Ver subastas activas
        </a>
      </div>`;
    return;
  }
  lista.innerHTML = ganadas.map(p => `
    <div class="actividad-card">
      <div class="actividad-img">
        ${p.urlImagen
          ? `<img src="${p.urlImagen}" alt="${p.tituloSubasta}" onerror="this.parentElement.textContent='🏆'">`
          : '🏆'}
      </div>
      <div class="actividad-info">
        <p class="actividad-titulo">${p.tituloSubasta || 'Subasta #' + p.subastaId}</p>
        <div class="actividad-meta">
          <span style="color:var(--color-success); font-weight:600">✓ Ganada</span>
          <span>Pagado: ${formatMoney(p.miMejorPuja)}</span>
        </div>
      </div>
      <div class="actividad-monto ganada">${formatMoney(p.miMejorPuja)}</div>
      <div class="actividad-acciones">
        <a href="auction-detail.html?id=${p.subastaId}" class="btn btn-secondary btn-sm">Ver →</a>
      </div>
    </div>`).join('');
}

// ── Navegación de tabs ────────────────────────────────
document.querySelectorAll('.actividades-tab').forEach(tab => {
  tab.addEventListener('click', () => activarTab(tab.id));
});

function activarTab(tabId) {
  document.querySelectorAll('.actividades-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.seccion-panel').forEach(p => p.classList.remove('activa'));
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.panel);
    if (panel) panel.classList.add('activa');
  }
}

// ── Helpers ───────────────────────────────────────────
function estadoLabel(e) {
  return { ACTIVA: 'Activa', PROGRAMADA: 'Próxima', FINALIZADA: 'Finalizada', DESIERTA: 'Desierta' }[e] ?? (e || '');
}
function formatMoney(n) {
  if (!n && n !== 0) return '—';
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}
function fechaLabel(s) {
  if (s.estado === 'ACTIVA' && s.fechaFin)         return `Cierra: ${formatFechaCorta(s.fechaFin)}`;
  if (s.estado === 'PROGRAMADA' && s.fechaInicio)  return `Inicia: ${formatFechaCorta(s.fechaInicio)}`;
  if (s.fechaFin)                                  return `Finalizó: ${formatFechaCorta(s.fechaFin)}`;
  return '';
}
function formatFechaCorta(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
