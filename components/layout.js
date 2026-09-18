/**
 * layout.js — Template global de SubastaYa
 * Inyecta el header y footer en todas las páginas.
 * Para cambiar el menú o la estructura del header/footer,
 * modificá SOLO este archivo.
 */

function initLayout() {
  const enSubcarpeta = window.location.pathname.includes('/pages/');
  const ROOT = enSubcarpeta ? '../' : './';

  // ── Guard: redirigir a identificación si no hay sesión ──
  // index.html y identificacion.html manejan su propia lógica de sesión
  const path = window.location.pathname;
  const esPublica = path.endsWith('/') || path.endsWith('index.html') ||
                    path.includes('identificacion.html');
  const email = localStorage.getItem('subastaYa_email');

  if (!esPublica && !email) {
    window.location.href = `${ROOT}pages/identificacion.html`;
    return;
  }

  // ── Header ──────────────────────────────────────────────
  const headerEl = document.getElementById('app-header');
  if (headerEl) {
    const nombre     = localStorage.getItem('subastaYa_nombre') || email || '';
    const rol        = localStorage.getItem('subastaYa_rol') ?? '';
    const esVendedor = rol.toLowerCase() === 'vendedor';

    headerEl.innerHTML = `
      <header class="main-header">
        <div class="main-header__inner">

          <a href="${ROOT}index.html" class="main-header__logo">
            SubastaYa
          </a>

          <nav class="main-header__nav">
            <a href="${ROOT}index.html">Subastas</a>
            <a href="${ROOT}pages/wallet.html">Billetera</a>
            <a href="${ROOT}pages/user-activity.html">Mis actividades</a>
          </nav>

          <div class="main-header__actions">
            ${esVendedor ? `<a href="${ROOT}pages/create-auction.html" class="btn btn-primary btn-sm">+ Publicar</a>` : ''}
            <div class="header-usuario">
              <span class="header-usuario__email" title="${email}">${nombre}</span>
              <button class="btn btn-secondary btn-sm" id="btn-salir">Salir</button>
            </div>
          </div>

          <button class="main-header__burger" id="nav-burger" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>

        </div>

        <div class="main-header__mobile-nav" id="mobile-nav" hidden>
          <a href="${ROOT}index.html">Subastas</a>
          <a href="${ROOT}pages/wallet.html">Billetera</a>
          <a href="${ROOT}pages/user-activity.html">Mis actividades</a>
          ${esVendedor ? `<a href="${ROOT}pages/create-auction.html">Publicar subasta</a>` : ''}
          <hr style="border-color:rgba(255,255,255,.1); margin:8px 0">
          <span style="font-size:13px; color:rgba(255,255,255,.5); padding:4px 0">${nombre}</span>
          <button class="btn btn-secondary btn-sm" id="btn-salir-mobile" style="margin-top:4px; width:100%; justify-content:center">
            Salir
          </button>
        </div>
      </header>
    `;

    // Hamburguesa mobile
    document.getElementById('nav-burger').addEventListener('click', () => {
      const nav = document.getElementById('mobile-nav');
      nav.hidden = !nav.hidden;
    });

    // Cerrar sesión (desktop y mobile)
    function cerrarSesion() {
      ['subastaYa_email', 'subastaYa_userId', 'subastaYa_nombre', 'subastaYa_token']
        .forEach(k => localStorage.removeItem(k));
      window.location.href = `${ROOT}pages/identificacion.html`;
    }
    document.getElementById('btn-salir')?.addEventListener('click', cerrarSesion);
    document.getElementById('btn-salir-mobile')?.addEventListener('click', cerrarSesion);

    // Resalta link activo
    headerEl.querySelectorAll('a').forEach(link => {
      if (link.href === window.location.href) link.classList.add('active');
    });
  }

  // ── Footer ──────────────────────────────────────────────
  const footerEl = document.getElementById('app-footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <footer class="main-footer">
        <div class="main-footer__inner">
          <span class="main-footer__brand">SubastaYa</span>
          <span class="main-footer__sep">·</span>
          <span>Proyecto de Software 2026</span>
        </div>
      </footer>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLayout);
} else {
  initLayout();
}
