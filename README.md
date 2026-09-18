# SubastaYa — Frontend

Interfaz de usuario en Vanilla JS (ES modules) servida directamente por el backend.

---

## Cómo correrlo

El backend sirve el frontend. No hace falta levantar un servidor aparte.

```bash
# Desde backend/src/Api
dotnet run --launch-profile http
```

Abrir en: **`http://localhost:5073`**

> No abrir los `.html` como archivo local (doble clic). El browser bloquea las requests desde `file://`.

---

## Autenticación

El login usa `POST /api/v1/auth/login` (email + contraseña). Al ingresar, la sesión queda guardada en `localStorage`:

| Clave | Contenido |
|---|---|
| `subastaYa_userId` | ID numérico del usuario |
| `subastaYa_email` | Email |
| `subastaYa_nombre` | Nombre completo |
| `subastaYa_token` | JWT Bearer |
| `subastaYa_rol` | `Comprador` o `Vendedor` |

Para cerrar sesión basta con limpiar el `localStorage`.

---

## Usuarios de prueba

Contraseña de todos: `Password123!`

| Email | Rol | Total | Retenido | Disponible | Notas |
|---|---|---|---|---|---|
| `vendedor@test.com` | Vendedor | $0 | $0 | $0 | Publicó las 5 subastas del seed |
| `comprador1@test.com` | Comprador | $150.000 | $45.000 | $105.000 | Postor líder en iPhone |
| `comprador2@test.com` | Comprador | $200.000 | $0 | $200.000 | Postor habilitado; ganó la Bicicleta Fixie (liquidación pendiente del worker) |
| `sinfondos@test.com` | Comprador | $500 | $0 | $500 | Para probar rechazo por fondos insuficientes |

---

## Subastas cargadas (seed)

Las fechas son relativas al momento en que se ejecutó el seeder por primera vez.

| Subasta | Estado inicial | Para probar |
|---|---|---|
| iPhone 15 Pro Max | ACTIVA (cierra ~25 min) | Pujas normales, retención de saldo |
| Charizard 1ª Edición | ACTIVA (cierra ~90 s) | Anti-sniping: extensión automática de +2 min |
| Chaqueta Vintage Dior | PRÓXIMA (+24 hs) | Subastas bloqueadas para pujas |
| Bicicleta Fixie Vintage | FINALIZADA | Historial, ganador: comprador2 |
| Funda Para Laptop | DESIERTA | Subasta sin pujas |

> Si todas las activas ya vencieron, podés reiniciar el seed borrando la BD y corriendo `dotnet ef database update` desde `backend/src/Api`.

---

## Roles y permisos

| Acción | Comprador | Vendedor |
|---|---|---|
| Ver catálogo | ✓ | ✓ |
| Ver detalle de subasta | ✓ | ✓ |
| Pujar | ✓ | ✗ |
| Publicar subasta | ✗ | ✓ |
| Billetera (saldo + depósito) | ✓ | ✓ |
| Mis actividades | ✓ | ✓ |

El botón `+ Publicar` solo aparece para usuarios con rol `Vendedor`.
