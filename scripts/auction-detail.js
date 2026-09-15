import { getAuction } from '../services/auctions.js';
import { placeBid, getBids } from '../services/bids.js';

// ── Leer ID de la URL (?id=1) ─────────────────────────
const params    = new URLSearchParams(window.location.search);
const auctionId = params.get('id');

if (!auctionId) {
  window.location.href = '../index.html';
}

// ── Estado ────────────────────────────────────────────
let subasta       = null;
let serverOffset  = 0;
let timerInterval = null;
let pollingInterval = null;

// ── Inicio ────────────────────────────────────────────
init();

async function init() {
  try {
    const [sub, bids] = await Promise.all([
      getAuction(auctionId),
      getBids(auctionId),
    ]);
    subasta = sub;
    serverOffset = new Date(sub.fechaServidor) - new Date();

    renderSubasta(sub);
    renderHistorial(bids);
    mostrarCargando(false);

    if (sub.estado === 'ACTIVA') {
      timerInterval   = setInterval(actualizarTimer, 1000);
      pollingInterval = setInterval(polling, 5000);
    }
  } catch (err) {
    mostrarError();
  }
}

// ── Polling (actualiza precios cada 5s) ───────────────
async function polling() {
  try {
    const fresh = await getAuction(auctionId);
    serverOffset = new Date(fresh.fechaServidor) - new Date();

    if (fresh.ofertaMasAlta !== subasta.ofertaMasAlta ||
        fresh.cantidadOfertas !== subasta.cantidadOfertas) {
      subasta = fresh;
      actualizarPrecios(fresh);
      const bids = await getBids(auctionId);
      renderHistorial(bids);
    }

    if (fresh.estado !== 'ACTIVA') {
      clearInterval(timerInterval);
      clearInterval(pollingInterval);
      subasta = fresh;
      renderSubasta(fresh);
    }
  } catch (_) {}
}

// ── Render principal ──────────────────────────────────
function renderSubasta(s) {
  document.title = `${s.titulo} — SubastaYa`;

  const bc = document.getElementById('breadcrumb-titulo');
  if (bc) bc.textContent = s.titulo;

  // Imagen
  const img = document.getElementById('img-subasta');
  const fallback = document.getElementById('img-fallback');
  if (s.urlImagen) {
    img.src = s.urlImagen;
    img.alt = s.titulo;
    img.onerror = () => { img.hidden = true; fallback.hidden = false; };
  } else {
    img.hidden = true;
    fallback.hidden = false;
  }

  // Badges y textos
  document.getElementById('badge-categoria').textContent = s.categoriaNombre;
  document.getElementById('badge-estado').textContent    = estadoLabel(s.estado);
  document.getElementById('badge-estado').className      = `badge badge-${s.estado.toLowerCase()}`;
  document.getElementById('titulo-subasta').textContent  = s.titulo;
  document.getElementById('vendedor-info').textContent   = `Vendido por ${s.vendedorNombre}`;
  document.getElementById('descripcion-subasta').textContent = s.descripcion;
  document.getElementById('precio-base-info').textContent =
    `Precio base: ${formatMoney(s.precioBase)} · Incremento mínimo: ${formatMoney(s.incrementoMinimo)}`;

  actualizarPrecios(s);

  // Timer y formulario según estado
  const timerBox  = document.getElementById('timer-box');
  const formPuja  = document.getElementById('form-puja');
  const finBox    = document.getElementById('estado-finalizado');
  const proximaBox = document.getElementById('proxima-puja-wrap');

  timerBox.hidden  = false;
  formPuja.hidden  = true;
  finBox.hidden    = true;
  proximaBox.hidden = true;

  if (s.estado === 'ACTIVA') {
    document.getElementById('timer-subtexto').textContent = 'restantes';
    formPuja.hidden  = false;
    proximaBox.hidden = false;
    document.getElementById('input-monto').placeholder =
      `Mínimo ${formatMoney(s.proximaPujaMinima)}`;
    // Prellenar usuario desde localStorage
    const uid = localStorage.getItem('subastaYa_userId');
    if (uid) document.getElementById('input-comprador').value = uid;

  } else if (s.estado === 'PROGRAMADA') {
    document.getElementById('timer-subtexto').textContent = 'para el inicio';

  } else {
    timerBox.hidden = true;
    finBox.hidden   = false;
    document.getElementById('fin-estado').textContent =
      s.estado === 'FINALIZADA' ? 'Subasta finalizada' : 'Subasta desierta — sin ofertas';
    if (s.estado === 'FINALIZADA' && s.ofertaMasAlta) {
      document.getElementById('fin-ganador').textContent =
        `Precio final: ${formatMoney(s.ofertaMasAlta)}`;
    }
  }

  actualizarTimer();
}

function actualizarPrecios(s) {
  const ofertaEl = document.getElementById('oferta-actual');
  if (s.ofertaMasAlta) {
    ofertaEl.textContent  = formatMoney(s.ofertaMasAlta);
    ofertaEl.className    = 'precio-valor';
  } else {
    ofertaEl.textContent  = 'Sin ofertas';
    ofertaEl.className    = 'precio-valor sin-ofertas';
  }
  document.getElementById('cantidad-pujas').textContent = s.cantidadOfertas;

  const proximaEl = document.getElementById('proxima-puja');
  if (proximaEl) {
    proximaEl.textContent = formatMoney(s.proximaPujaMinima);
    if (document.getElementById('input-monto')) {
      document.getElementById('input-monto').placeholder =
        `Mínimo ${formatMoney(s.proximaPujaMinima)}`;
    }
  }
}

// ── Timer ─────────────────────────────────────────────
function actualizarTimer() {
  if (!subasta) return;
  const el = document.getElementById('timer-valor-grande');
  if (!el) return;

  const ahora = Date.now() + serverOffset;
  const ref   = subasta.estado === 'PROGRAMADA'
    ? new Date(subasta.fechaInicio).getTime()
    : new Date(subasta.fechaFin).getTime();
  const diff = ref - ahora;

  if (diff <= 0) {
    el.textContent = '00:00:00';
    return;
  }
  el.textContent = formatTiempo(diff);
  el.classList.toggle('urgente', subasta.estado === 'ACTIVA' && diff < 5 * 60 * 1000);
}

// ── Formulario de puja ────────────────────────────────
document.getElementById('btn-pujar')?.addEventListener('click', async () => {
  const compradorId = Number(document.getElementById('input-comprador').value);
  const monto       = Number(document.getElementById('input-monto').value);
  const alertaEl    = document.getElementById('alerta-puja');
  const btnPujar    = document.getElementById('btn-pujar');

  alertaEl.innerHTML = '';

  if (!compradorId || compradorId <= 0) {
    mostrarAlerta(alertaEl, 'Ingresá tu ID de usuario.', 'error');
    return;
  }
  if (!monto || monto <= 0) {
    mostrarAlerta(alertaEl, 'Ingresá un monto válido.', 'error');
    return;
  }

  btnPujar.disabled   = true;
  btnPujar.textContent = 'Enviando…';

  try {
    const res = await placeBid(auctionId, { compradorId, monto });

    // Guardar usuario para próximas pujas
    localStorage.setItem('subastaYa_userId', compradorId);

    // Actualizar precios en pantalla
    subasta.ofertaMasAlta    = res.ofertaMasAlta;
    subasta.cantidadOfertas  = res.cantidadOfertas;
    subasta.proximaPujaMinima = res.proximaPujaMinima;
    subasta.fechaFin          = res.fechaFin;
    actualizarPrecios(subasta);

    // Limpiar monto
    document.getElementById('input-monto').value = '';
    mostrarAlerta(alertaEl, `¡Puja de ${formatMoney(monto)} registrada!`, 'success');

    // Anti-sniping: el backend extendió el tiempo
    if (res.extendida) {
      mostrarToast('⏱ ¡Tiempo extendido! +2 minutos');
    }

    // Recargar historial
    const bids = await getBids(auctionId);
    renderHistorial(bids);

  } catch (err) {
    const msg = err?.detail || err?.title || 'No se pudo registrar la puja.';
    mostrarAlerta(alertaEl, msg, 'error');
  } finally {
    btnPujar.disabled    = false;
    btnPujar.textContent = 'Pujar →';
  }
});

// ── Historial ─────────────────────────────────────────
function renderHistorial(bids) {
  const lista = document.getElementById('historial-lista');
  if (bids.length === 0) {
    lista.innerHTML = '<p class="historial-vacio">Todavía no hay pujas.</p>';
    return;
  }
  lista.innerHTML = bids.map((b, i) => `
    <div class="puja-item ${i === 0 ? 'primera' : ''}">
      <div>
        <span class="puja-monto">${formatMoney(b.monto)}</span>
        <span class="puja-postor"> · ${b.seudonimo}</span>
      </div>
      <span class="puja-fecha">${formatFecha(b.fechaPuja)}</span>
    </div>
  `).join('');
}

// ── UI helpers ────────────────────────────────────────
function mostrarCargando(visible) {
  document.getElementById('estado-carga').hidden   = !visible;
  document.getElementById('auction-content').hidden = visible;
}

function mostrarError() {
  document.getElementById('estado-carga').hidden = false;
  document.getElementById('estado-carga').innerHTML = `
    <div class="estado-carga" style="text-align:center; padding:60px 20px">
      <span style="font-size:40px">⚠️</span>
      <p style="margin-top:12px; color:var(--color-text-muted)">No se pudo cargar la subasta.</p>
      <a href="../index.html" class="btn btn-secondary btn-sm" style="margin-top:16px">
        ← Volver al catálogo
      </a>
    </div>`;
}

function mostrarAlerta(el, msg, tipo) {
  el.innerHTML = `<div class="alerta alerta-${tipo === 'error' ? 'error' : 'success'}">${msg}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 5000);
}

function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className   = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Formato ───────────────────────────────────────────
function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}
function formatTiempo(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}
function formatFecha(iso) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
function estadoLabel(e) {
  return { ACTIVA: 'Activa', PROGRAMADA: 'Próxima', FINALIZADA: 'Finalizada', DESIERTA: 'Desierta' }[e] ?? e;
}
