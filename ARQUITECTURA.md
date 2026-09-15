# SubastaYa — Arquitectura Frontend

**Stack:** HTML5 · CSS3 (Variables) · JavaScript Vanilla  
**Backend:** ASP.NET Core 8 · `http://localhost:5073/api/v1`

---

## La idea central

Un solo lugar controla el formato de todas las páginas:

```
variables.css  →  layout.js  →  Todas las páginas
(colores/fuentes)  (header/footer)   (HTML individuales)
```

---

## Estructura de carpetas

```
SubastaYa-Front/
│
├── styles/
│   ├── variables.css     ← CLAVE: colores, fuentes, radios — cambiá aquí para cambiar TODO
│   ├── global.css        ← Reset + estilos base (body, títulos, page-content)
│   ├── components.css    ← Botones, inputs, badges, alertas
│   └── layout.css        ← Estilos del header y footer globales
│
├── components/
│   └── layout.js         ← CLAVE: inyecta el header y footer en todas las páginas
│
├── services/
│   ├── api.js            ← CLAVE: URL del backend — cambiar solo aquí
│   ├── auctions.js       ← Llamadas a /auctions
│   ├── bids.js           ← Llamadas a /auctions/{id}/bids
│   └── wallet.js         ← Llamadas a /wallet
│
├── pages/
│   ├── auction-detail.html   ← T2: Sala de subasta
│   ├── create-auction.html   ← T3: Publicar subasta
│   ├── wallet.html           ← T4: Billetera
│   ├── user-activity.html    ← T5: Mis actividades
│   └── login.html            ← T6: Iniciar sesión
│
└── index.html            ← T1: Home — Catálogo de subastas
```

---

## Referencia rápida: ¿dónde cambio cada cosa?

| Quiero cambiar…                   | Archivo                    |
|-----------------------------------|----------------------------|
| Color del header / botones        | `styles/variables.css`     |
| Estilo de botones (forma, tamaño) | `styles/components.css`    |
| Links del menú de navegación      | `components/layout.js`     |
| Estructura del header o footer    | `components/layout.js`     |
| URL del backend (puerto)          | `services/api.js`          |
| Contenido de una página           | `pages/nombre-pagina.html` |
| Llamadas a la API de subastas     | `services/auctions.js`     |

---

## Cómo usar el template en cada página

Todas las páginas siguen este patrón:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nombre de página — SubastaYa</title>

  <!-- Los 4 CSS siempre iguales -->
  <link rel="stylesheet" href="../styles/variables.css">
  <link rel="stylesheet" href="../styles/global.css">
  <link rel="stylesheet" href="../styles/components.css">
  <link rel="stylesheet" href="../styles/layout.css">
</head>
<body>

  <div id="app-header"></div>   <!-- header automático -->

  <main class="page-content">
    <!-- contenido específico de esta página -->
  </main>

  <div id="app-footer"></div>   <!-- footer automático -->

  <script src="../components/layout.js" type="module"></script>
</body>
</html>
```

> **Nota:** `index.html` usa `./` en lugar de `../` porque está en la raíz.

---

## Plan de tareas y ramas

| # | Tarea                   | Rama                       | Prioridad |
|---|-------------------------|----------------------------|-----------|
| T0 | Setup base             | `feature/setup-base`       | Crítica   |
| T1 | Home — Catálogo        | `feature/home-catalogo`    | Alta      |
| T2 | Detalle de subasta     | `feature/auction-detail`   | Alta      |
| T3 | Publicar subasta       | `feature/create-auction`   | Alta      |
| T4 | Billetera              | `feature/wallet`           | Media     |
| T5 | Mis Actividades        | `feature/user-activity`    | Media     |
| T6 | Login                  | `feature/login`            | Baja      |

---

## Variables CSS disponibles

```css
--color-primary          /* Color principal (botones, links) */
--color-primary-hover    /* Hover de botones primarios */
--color-header           /* Fondo del header */
--color-bg               /* Fondo de página */
--color-surface          /* Fondo de cards */
--color-text             /* Texto principal */
--color-text-muted       /* Texto secundario */
--color-border           /* Bordes */
--color-success          /* Verde — éxito */
--color-error            /* Rojo — error */
--font-sans              /* Fuente principal */
--font-size-base         /* Tamaño de texto base (15px) */
--radius                 /* Radio de bordes (8px) */
--radius-lg              /* Radio grande (12px) */
--shadow                 /* Sombra estándar */
--max-width              /* Ancho máximo del contenido */
--header-height          /* Alto del header fijo (64px) */
```
