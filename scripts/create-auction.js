import { createAuction } from '../services/auctions.js';

// ── Sesión ────────────────────────────────────────────
const vendedorId = Number(localStorage.getItem('subastaYa_userId'));

// ── Elementos del form ────────────────────────────────
const form       = document.getElementById('form-publicar');
const btnPublicar = document.getElementById('btn-publicar');
const alertaEl   = document.getElementById('alerta-form');

// ── Preview en tiempo real ────────────────────────────
const previewTitulo    = document.getElementById('preview-titulo');
const previewCategoria = document.getElementById('preview-categoria');
const previewBase      = document.getElementById('preview-base');
const previewIncremento = document.getElementById('preview-incremento');
const previewFecha     = document.getElementById('preview-fecha');
const previewImg       = document.getElementById('preview-img');
const previewImgFallback = document.getElementById('preview-img-fallback');

// Inputs
const inputTitulo     = document.getElementById('input-titulo');
const inputCategoria  = document.getElementById('input-categoria');
const inputBase       = document.getElementById('input-base');
const inputIncremento = document.getElementById('input-incremento');
const inputInicio     = document.getElementById('input-inicio');
const inputFin        = document.getElementById('input-fin');
const inputImagen     = document.getElementById('input-imagen');

// Fechas mínimas: ahora + 5 min
setFechasMinimas();

// ── Listeners de preview ──────────────────────────────
inputTitulo.addEventListener('input', () => {
  previewTitulo.textContent = inputTitulo.value || 'Título del artículo';
});
inputCategoria.addEventListener('change', () => {
  const opt = inputCategoria.options[inputCategoria.selectedIndex];
  previewCategoria.textContent = opt && opt.value ? opt.text : 'Categoría';
});
inputBase.addEventListener('input', () => {
  previewBase.textContent = inputBase.value ? formatMoney(inputBase.value) : '$0';
});
inputIncremento.addEventListener('input', () => {
  previewIncremento.textContent = inputIncremento.value ? formatMoney(inputIncremento.value) : '$0';
});
inputInicio.addEventListener('change', actualizarFechaPreview);
inputFin.addEventListener('change', actualizarFechaPreview);
inputImagen.addEventListener('input', () => {
  const url = inputImagen.value.trim();
  if (url) {
    previewImg.src = url;
    previewImg.hidden = false;
    previewImgFallback.hidden = true;
    previewImg.onerror = () => {
      previewImg.hidden = true;
      previewImgFallback.hidden = false;
    };
  } else {
    previewImg.hidden = true;
    previewImgFallback.hidden = false;
  }
});

function actualizarFechaPreview() {
  if (inputInicio.value && inputFin.value) {
    const ini = formatFechaCorta(new Date(inputInicio.value));
    const fin = formatFechaCorta(new Date(inputFin.value));
    previewFecha.textContent = `${ini} → ${fin}`;
  } else {
    previewFecha.textContent = '';
  }
}

// ── Cargar categorías desde el backend ────────────────
cargarCategorias();

async function cargarCategorias() {
  try {
    const res = await fetch('http://localhost:5073/api/v1/categories');
    if (!res.ok) throw new Error();
    const cats = await res.json();
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value       = c.id;
      opt.textContent = c.nombre;
      inputCategoria.appendChild(opt);
    });
  } catch (_) {
    // Si falla, el campo queda vacío; el usuario igual puede ingresar id manualmente
  }
}

// ── Submit ────────────────────────────────────────────
form.addEventListener('submit', async e => {
  e.preventDefault();
  alertaEl.innerHTML = '';

  const categoriaId = Number(inputCategoria.value);
  const titulo      = inputTitulo.value.trim();
  const descripcion = document.getElementById('input-descripcion').value.trim();
  const urlImagen   = inputImagen.value.trim();
  const precioBase  = Number(inputBase.value);
  const incremento  = Number(inputIncremento.value);
  const fechaInicio = inputInicio.value;
  const fechaFin    = inputFin.value;

  // Validaciones básicas
  if (!vendedorId) {
    mostrarAlerta('No hay sesión activa. <a href="../index.html">Ingresar</a>', 'error'); return;
  }
  if (!categoriaId) {
    mostrarAlerta('Seleccioná una categoría.', 'error'); return;
  }
  if (!titulo) {
    mostrarAlerta('El título es obligatorio.', 'error'); return;
  }
  if (!precioBase || precioBase <= 0) {
    mostrarAlerta('El precio base debe ser mayor a 0.', 'error'); return;
  }
  if (!incremento || incremento <= 0) {
    mostrarAlerta('El incremento mínimo debe ser mayor a 0.', 'error'); return;
  }
  if (!fechaInicio || !fechaFin) {
    mostrarAlerta('Las fechas de inicio y fin son obligatorias.', 'error'); return;
  }
  if (new Date(fechaFin) <= new Date(fechaInicio)) {
    mostrarAlerta('La fecha de fin debe ser posterior a la de inicio.', 'error'); return;
  }

  btnPublicar.disabled    = true;
  btnPublicar.textContent = 'Publicando…';

  try {
    const nueva = await createAuction({
      vendedorId,
      categoriaId,
      titulo,
      descripcion,
      urlImagen: urlImagen || null,
      precioBase,
      incrementoMinimo: incremento,
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin:    new Date(fechaFin).toISOString(),
    });

    // Redirigir al detalle de la subasta creada
    window.location.href = `auction-detail.html?id=${nueva.id}`;

  } catch (err) {
    const msg = err?.detail || err?.title || 'No se pudo publicar la subasta.';
    mostrarAlerta(msg, 'error');
    btnPublicar.disabled    = false;
    btnPublicar.textContent = 'Publicar subasta';
  }
});

// ── Helpers ───────────────────────────────────────────
function setFechasMinimas() {
  const ahora = new Date(Date.now() + 5 * 60 * 1000);
  const iso   = ahora.toISOString().slice(0, 16);
  inputInicio.min = iso;
  inputFin.min    = iso;

  inputInicio.addEventListener('change', () => {
    if (inputInicio.value) {
      const minFin = new Date(new Date(inputInicio.value).getTime() + 60 * 1000);
      inputFin.min = minFin.toISOString().slice(0, 16);
    }
  });
}

function mostrarAlerta(msg, tipo) {
  alertaEl.innerHTML = `<div class="alerta alerta-${tipo === 'error' ? 'error' : 'success'}">${msg}</div>`;
  alertaEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatFechaCorta(d) {
  return d.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
