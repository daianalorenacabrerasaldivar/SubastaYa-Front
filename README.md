# SubastaYa-Front
Front de Subasta Ya

## Cómo probarlo

El frontend **no puede abrirse como archivo local** (`file:///...`). Necesita ser servido por un servidor HTTP para poder comunicarse con el backend.

### 1. Levantar el backend

En la carpeta del backend, ejecutar con el perfil HTTP (sin HTTPS redirect en desarrollo):

```bash
dotnet run --launch-profile http
```

El backend queda disponible en `http://localhost:5073`.

### 2. Levantar el frontend

En la carpeta raíz del frontend:

```bash
npx serve -l 3000
```

### 3. Abrir en el browser

```
http://localhost:3000
```

> **Importante:** No abrir los archivos `.html` directamente con doble clic. El browser bloquea las requests desde `file://` al backend, y el login no funcionará.

### Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| `vendedor1@test.com` | `Test1234!` | Vendedor |
| `comprador1@test.com` | `Test1234!` | Comprador |
| `comprador2@test.com` | `Test1234!` | Comprador |
