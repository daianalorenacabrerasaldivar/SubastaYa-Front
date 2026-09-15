import { getBalance, getTransactions, deposit } from '../services/wallet.js';

// ── Estado ────────────────────────────────────────────
let usuarioId = null;

// ── Elementos ─────────────────────────────────────────
const inputUsuario  = document.getElementById('input-usuario');
const btnCargar     = document.getElementById('btn-cargar');
const saldoValor    = document.getElementById('saldo-valor');
const saldoUsuario  = document.getElementById('saldo-usuario');
const txLista       = document.getElementById('tx-lista');
const inputMonto    = document.getElementById('input-monto');
const btnDepositar  = document.getElementById('btn-depositar');
const alertaDeposito = document.getElementById('alerta-deposito');
const panelDatos    = document.getElementById('panel-datos');

// Prellenar con userId guardado en home/detalle
const savedId = localStorage.getItem('subastaYa_userId');
if (savedId) inputUsuario.value = savedId;

// ── Cargar datos ──────────────────────────────────────
btnCargar.addEventListener('click', cargarDatos);
inputUsuario.addEventListener('keydown', e => { if (e.key === 'Enter') cargarDatos(); });

async function cargarDatos() {
  const id = Number(inputUsuario.value);
  if (!id || id <= 0) {
    alertaDeposito.innerHTML = '<div class="alerta alerta-error">Ingresá un ID de usuario válido.</div>';
    return;
  }
  alertaDeposito.innerHTML = '';
  btnCargar.disabled    = true;
  btnCargar.textContent = 'Cargando…';

  try {
    const [balance, txs] = await Promise.all([
      getBalance(id),
      getTransactions(id),
    ]);
    usuarioId = id;
    localStorage.setItem('subastaYa_userId', id);

    saldoValor.textContent  = formatMoney(balance.saldo ?? balance.balance ?? 0);
    saldoUsuario.textContent = `Usuario #${id}`;
    renderTransacciones(txs);
    panelDatos.hidden = false;

  } catch (err) {
    alertaDeposito.innerHTML =
      '<div class="alerta alerta-error">No se encontró el usuario o hubo un error.</div>';
  } finally {
    btnCargar.disabled    = false;
    btnCargar.textContent = 'Ver billetera';
  }
}

// ── Atajos de monto ───────────────────────────────────
document.querySelectorAll('.monto-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.monto-chip').forEach(c => c.classList.remove('activo'));
    chip.classList.add('activo');
    inputMonto.value = chip.dataset.monto;
  });
});

inputMonto.addEventListener('input', () => {
  document.querySelectorAll('.monto-chip').forEach(c => c.classList.remove('activo'));
});

// ── Depósito ──────────────────────────────────────────
btnDepositar.addEventListener('click', async () => {
  alertaDeposito.innerHTML = '';

  if (!usuarioId) {
    alertaDeposito.innerHTML = '<div class="alerta alerta-error">Primero cargá tu billetera.</div>';
    return;
  }
  const monto = Number(inputMonto.value);
  if (!monto || monto <= 0) {
    alertaDeposito.innerHTML = '<div class="alerta alerta-error">Ingresá un monto válido.</div>';
    return;
  }

  btnDepositar.disabled    = true;
  btnDepositar.textContent = 'Depositando…';

  try {
    const res = await deposit({ usuarioId, monto });
    saldoValor.textContent = formatMoney(res.saldo ?? res.nuevoSaldo ?? res.balance ?? 0);

    alertaDeposito.innerHTML =
      `<div class="alerta alerta-success">¡Se acreditaron ${formatMoney(monto)}!</div>`;
    inputMonto.value = '';
    document.querySelectorAll('.monto-chip').forEach(c => c.classList.remove('activo'));

    // Recargar historial
    const txs = await getTransactions(usuarioId);
    renderTransacciones(txs);

  } catch (err) {
    const msg = err?.detail || err?.title || 'No se pudo realizar el depósito.';
    alertaDeposito.innerHTML = `<div class="alerta alerta-error">${msg}</div>`;
  } finally {
    btnDepositar.disabled    = false;
    btnDepositar.textContent = 'Depositar';
  }
});

// ── Render historial ──────────────────────────────────
function renderTransacciones(txs) {
  if (!txs || txs.length === 0) {
    txLista.innerHTML = '<p class="tx-vacio">Todavía no hay movimientos.</p>';
    return;
  }
  txLista.innerHTML = txs.map(tx => {
    const tipo   = clasificarTipo(tx.tipo);
    const signo  = tipo === 'credito' || tipo === 'liberado' ? '+' : '-';
    return `
      <div class="tx-item">
        <div class="tx-icono ${tipo}">${iconoTipo(tipo)}</div>
        <div class="tx-info">
          <p class="tx-concepto">${tx.concepto || tx.descripcion || labelTipo(tx.tipo)}</p>
          <p class="tx-fecha">${formatFecha(tx.fecha || tx.fechaCreacion)}</p>
        </div>
        <span class="tx-monto ${tipo}">${signo}${formatMoney(tx.monto)}</span>
      </div>`;
  }).join('');
}

// ── Helpers ───────────────────────────────────────────
function clasificarTipo(tipo) {
  if (!tipo) return 'credito';
  const t = tipo.toLowerCase();
  if (t.includes('deposit') || t.includes('acredit') || t.includes('credito')) return 'credito';
  if (t.includes('reten'))   return 'retenido';
  if (t.includes('liber'))   return 'liberado';
  return 'debito';
}

function iconoTipo(tipo) {
  return { credito: '💰', debito: '🔴', retenido: '🔒', liberado: '🔓' }[tipo] ?? '💳';
}

function labelTipo(tipo) {
  if (!tipo) return 'Transacción';
  const t = tipo.toLowerCase();
  if (t.includes('deposit'))   return 'Depósito';
  if (t.includes('reten'))     return 'Retención de puja';
  if (t.includes('liber'))     return 'Liberación de puja';
  if (t.includes('cobro') || t.includes('debito')) return 'Cobro';
  return 'Transacción';
}

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

function formatFecha(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
