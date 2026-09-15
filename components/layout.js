/**
 * layout.js — Template global de SubastaYa
 * Inyecta el header y footer en todas las páginas.
 * Para cambiar el menú o la estructura del header/footer,
 * modificá SOLO este archivo.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Detecta si la página está dentro de /pages/ para ajustar rutas relativas
  const enSubcarpeta = window.location.pathname.includes('/pages/');
  const ROOT = enSubcarpeta ? '../' : './';

  // ── Header ──────────────────────────────────────────
  const headerEl = document.getElementById('app-header');
  if (headerEl) {
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
            <a href="${ROOT}pages/create-auction.html" class="btn btn-primary btn-sm">
              + Publicar
            </a>
            <a href="${ROOT}pages/login.html" class="btn btn-secondary btn-sm" id="btn-login">
              Iniciar sesión
            </a>
          </div>

          <!-- Botón hamburguesa para mobile -->
          <button class="main-header__burger" id="nav-burger" aria-label="Menú">
            <span></span><span></span><span></span>
          </button>

        </div>

        <!-- Menú mobile desplegable -->
        <div class="main-header__mobile-nav" id="mobile-nav" hidden>
          <a href="${ROOT}index.html">Subastas</a>
          <a href="${ROOT}pages/wallet.html">Billetera</a>
          <a href="${ROOT}pages/user-activity.html">Mis actividades</a>
          <a href="${ROOT}pages/create-auction.html">Publicar subasta</a>
          <a href="${ROOT}pages/login.html">Iniciar sesión</a>
        </div>
      </header>
    `;

    // Hamburguesa mobile
    document.getElementById('nav-burger').addEventListener('click', () => {
      const nav = document.getElementById('mobile-nav');
      nav.hidden = !nav.hidden;
    });

    // Resalta el link activo según la URL actual
    const links = headerEl.querySelectorAll('a');
    links.forEach(link => {
      if (link.href === window.location.href) {
        link.classList.add('active');
      }
    });
  }

  // ── Footer ──────────────────────────────────────────
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
});
