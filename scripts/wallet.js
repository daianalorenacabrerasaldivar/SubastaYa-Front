import { getBalance, getTransactions, deposit } from '../services/wallet.js';

// ── Estado ────────────────────────────────────────────
const usuarioId   = Number(localStorage.getItem('subastaYa_userId'));
const nombreUsuario = localStorage.getItem('subastaYa_nombre')
                   || localStorage.getItem('subastaYa_email')
                   || `Usuario #${usuarioId}`;

// ── Elementos ─────────────────────────────────────────
const saldoValor     = document.getElementById('saldo-valor');
const saldoUsuario   = document.getElementById('saldo-usuario');
const txLista        = document.getElementById('tx-lista');
const inputMonto     = document.getElementById('input-monto');
const btnDepositar   = document.getElementById('btn-depositar');
const alertaDeposito = document.getElementById('alerta-deposito');
const panelDatos     = document.getElementById('panel-datos');
const estadoCarga    = document.getElementById('estado-carga-wallet');

// ── Carga automática ──────────────────────────────────
cargarDatos();

async function cargarDatos() {
  if (!usuarioId) {
    if (estadoCarga) estadoCarga.hidden = true;
    alertaDeposito.innerHTML =
      '<div class="alerta alerta-error">No hay sesión activa. <a href="../index.html">Ingresar</a></div>';
    return;
  }

  try {
    const [balance, txs] = await Promise.all([
      getBalance(usuarioId),
      getTransactions(usuarioId),
    ]);

    saldoValor.textContent   = formatMoney(balance.saldoDisponible ?? 0);
    saldoUsuario.textContent = nombreUsuario;
    const elTotal    = document.getElementById('saldo-total');
    const elRetenido = document.getElementById('saldo-retenido');
    if (elTotal)    elTotal.textContent    = formatMoney(balance.saldoTotal    ?? 0);
    if (elRetenido) elRetenido.textContent = formatMoney(balance.saldoRetenido ?? 0);
    renderTransacciones(txs);

    if (estadoCarga) estadoCarga.hidden = true;
    panelDatos.hidden = false;

  } catch (err) {
    if (estadoCarga) estadoCarga.hidden = true;
    alertaDeposito.innerHTML =
      '<div class="alerta alerta-error">No se pudo cargar la billetera. Verificá que el backend esté corriendo.</div>';
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

  const monto = Number(inputMonto.value);
  if (!monto || monto <= 0) {
    alertaDeposito.innerHTML = '<div class="alerta alerta-error">Ingresá un monto válido.</div>';
    return;
  }

  btnDepositar.disabled    = true;
  btnDepositar.textContent = 'Depositando…';

  try {
    const res = await deposit({ usuarioId, monto });
    saldoValor.textContent = formatMoney(res.saldoDisponible ?? 0);
    const elTotal    = document.getElementById('saldo-total');
    const elRetenido = document.getElementById('saldo-retenido');
    if (elTotal)    elTotal.textContent    = formatMoney(res.saldoTotal    ?? 0);
    if (elRetenido) elRetenido.textContent = formatMoney(res.saldoRetenido ?? 0);

    alertaDeposito.innerHTML =
      `<div class="alerta alerta-success">¡Se acreditaron ${formatMoney(monto)}!</div>`;
    inputMonto.value = '';
    document.querySelectorAll('.monto-chip').forEach(c => c.classList.remove('activo'));

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
    const tipo  = clasificarTipo(tx.tipo);
    const signo = tipo === 'credito' || tipo === 'liberado' ? '+' : '-';
    return `
      <div class="tx-item">
        <div class="tx-icono ${tipo}">${iconoTipo(tipo)}</div>
        <div class="tx-info">
          <p class="tx-concepto">${labelTipo(tx.tipo)}</p>
          <p class="tx-fecha">${formatFecha(tx.fecha)}</p>
        </div>
        <span class="tx-monto ${tipo}">${signo}${formatMoney(tx.monto)}</span>
      </div>`;
  }).join('');
}

// ── Helpers ───────────────────────────────────────────
function clasificarTipo(tipo) {
  if (tipo === 'Deposito' || tipo === 'Cobro') return 'credito';
  if (tipo === 'Liberacion')                  return 'liberado';
  if (tipo === 'Retencion')                   return 'retenido';
  if (tipo === 'Pago')                        return 'debito';
  return 'credito';
}

function iconoTipo(tipo) {
  return { credito: '💰', debito: '🔴', retenido: '🔒', liberado: '🔓' }[tipo] ?? '💳';
}

function labelTipo(tipo) {
  const labels = {
    Deposito:   'Depósito de crédito',
    Retencion:  'Retención por puja',
    Liberacion: 'Liberación de puja',
    Pago:       'Pago de subasta ganada',
    Cobro:      'Cobro de venta',
  };
  return labels[tipo] ?? tipo ?? 'Transacción';
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
