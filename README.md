# SubastaYa — Frontend

## Cómo correrlo

El backend sirve el frontend directamente. No hace falta levantar un servidor aparte.

```bash
# Desde backend/src/Api
dotnet run --launch-profile http
```

Abrir en: **`http://localhost:5073`**

> No abrir los `.html` como archivo local (doble clic). El browser bloquea las requests desde `file://`.

---

## Usuarios de prueba

Contraseña de todos: `Password123!`

| Email | Rol | Qué puede hacer |
|---|---|---|
| `vendedor@test.com` | Vendedor | Publicar subastas, ver catálogo, cobrar ventas |
| `comprador1@test.com` | Comprador | Pujar, ver billetera ($150.000 disponibles), mis actividades |
| `comprador2@test.com` | Comprador | Pujar, ver billetera ($180.500 disponibles), ganó la Bicicleta Fixie |
| `sinfondos@test.com` | Comprador | Saldo $500 — útil para probar rechazo por fondos insuficientes |

---

## Subastas cargadas (seed)

| Subasta | Estado | Para probar |
|---|---|---|
| iPhone 15 Pro Max | ACTIVA | Pujas normales, retención de saldo |
| Charizard 1ª Edición | ACTIVA (zona crítica) | Anti-sniping (extensión de 2 min) |
| Chaqueta Vintage Dior | PRÓXIMA (+24 hs) | Subastas bloqueadas para pujas |
| Bicicleta Fixie Vintage | FINALIZADA | Historial, ganador: comprador2 |
| Funda Para Laptop | DESIERTA | Subasta sin pujas |

---

## Roles y permisos

**Comprador:** ver catálogo · pujar · billetera · mis actividades  
**Vendedor:** ver catálogo · publicar subastas · mis actividades · cobrar ventas

> El botón `+ Publicar` solo debería aparecer para Vendedores (fix pendiente).
