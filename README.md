# TodoStock S.A. — Backend REST

Backend REST para **TodoStock S.A.**, distribuidora mayorista de productos de limpieza.  
Desarrollado con **Node.js**, **Express** y **MongoDB Atlas** (Mongoose). Incluye vistas renderizadas con **Pug** y autenticación con **JWT** + **express-session** + **bcrypt**, y sistema de roles (admin / user).

---

## Demo en producción

**URL:** https://todostock-99j7.onrender.com  
**Usuario:** `usuario` | **Contraseña:** `123456`

> El servidor es de plan gratuito (Render). Si no responde en el primer intento, esperá 30 segundos — se reactiva automáticamente.

---

## Requisitos

- Node.js v18 o superior
- npm
- MongoDB Atlas (o MongoDB local v6+)

---

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```
MONGODB_URI=tu_uri_de_mongodb_atlas
PORT=3000
SESSION_SECRET=clave_secreta_larga_y_random
JWT_SECRET=otra_clave_secreta_larga_y_random
```

Para MongoDB Atlas, reemplazá `MONGODB_URI` por tu URI de conexión.

## Carga inicial de datos (Seed)

Para importar los datos de prueba y crear el usuario admin:

```bash
node seed.js
```

Esto elimina los datos existentes e inserta los registros de prueba en todas las colecciones, y crea el usuario `usuario` / `123456`.

## Ejecución

**Desarrollo** (con recarga automática via nodemon):

```bash
npm run dev
```

**Producción:**

```bash
npm start
```

El servidor levanta en `http://localhost:3000`.

---

## Estructura del proyecto

```
todostock/
├── seed.js             → script de carga inicial de datos en MongoDB
├── src/
│   ├── index.js        → punto de entrada, conecta MongoDB y levanta el servidor
│   ├── app.js          → configuración de Express, middlewares y rutas
│   ├── config/
│   │   └── db.js       → conexión a MongoDB con Mongoose
│   ├── models/         → esquemas Mongoose para cada entidad
│   ├── controllers/    → lógica de negocio y respuestas HTTP - login, registro, JWT, protegerRuta, soloAdmin
│   ├── routes/         → definición de endpoints (vistas + API REST)
│   ├── validators/     → validaciones de datos de entrada
│   ├── views/          → plantillas Pug (interfaz web)
│   └── data/           → archivos JSON originales (usados por seed.js)
├── package.json
└── .gitignore
```

---

## Autenticación, autorización y roles

El sistema usa **express-session** con contraseñas hasheadas con **bcrypt**.  
Al iniciar sesión, el rol del usuario (`admin` o `user`) se almacena en la sesión y controla el acceso a ciertas funciones.

- Al hacer login o registrarse, se genera un **token JWT** (duración: 1 hora) que se guarda en una **cookie httpOnly**.
- La sesión también se setea en el servidor con **express-session**.
- `protegerRuta` verifica primero la sesión; si expiró, verifica el JWT de la cookie y restaura la sesión automáticamente.
- Al cerrar sesión se destruyen tanto la sesión como la cookie del token.
- Las contraseñas se hashean con **bcrypt** antes de guardarse en la base de datos. Nunca se almacenan en texto plano.
- El navegador no cachea páginas protegidas (`Cache-Control: no-store`).

| Método | Ruta        | Descripción              |
|--------|-------------|--------------------------|
| GET    | `/login`    | Formulario de login      |
| POST   | `/login`    | Iniciar sesión           |
| GET    | `/registro` | Formulario de registro   |
| POST   | `/registro` | Crear cuenta nueva       |
| GET    | `/logout`   | Cerrar sesión            |

Todas las rutas están protegidas. Sin sesión activa, redirige a `/login`.

### Roles

| Rol   | Permisos                                                                                                              |
|-------|-----------------------------------------------------------------------------------------------------------------------|
| admin | Todo: ver, crear, editar y **eliminar** en todos los módulos. Accede a `/usuarios`.                                   |
| user  | Puede ver, crear y editar. **No puede eliminar** clientes, productos, ventas ni proveedores. No ve `/usuarios`.       |


---

## Rutas de vistas (interfaz web)

### Usuarios (solo admin)

| Método | Ruta                    | Descripción          |
|--------|-------------------------|----------------------|
| GET    | `/usuarios`             | Listado de usuarios  |
| GET    | `/usuarios/:id/editar`  | Editar usuario       |
| POST   | `/usuarios/:id/editar`  | Guardar cambios      |
| POST   | `/usuarios/:id/rol`     | Cambiar rol          |
| POST   | `/usuarios/:id/eliminar`| Eliminar usuario     |


### Productos

| Método | Ruta                        | Descripción                                  |
| ------ | --------------------------- | -------------------------------------------- |
| GET    | `/productos`                | Listado de productos                         |
| GET    | `/productos/nuevo`          | Formulario nuevo producto                    |
| POST   | `/productos`                | Crear producto (+ lote inicial si stock > 0) |
| GET    | `/productos/:id/editar`     | Formulario editar                            |
| PUT    | `/productos/:id`            | Actualizar producto                          |    
| DELETE | `/productos/:id`            | Eliminar producto                            |


### Proveedores

| Método | Ruta                          | Descripción               |
| ------ | ----------------------------- | ------------------------- |
| GET    | `/proveedores`                | Listado de proveedores    |
| GET    | `/proveedores/nuevo`          | Formulario nuevo          |
| POST   | `/proveedores`                | Crear proveedor           |
| GET    | `/proveedores/:id/editar`     | Formulario editar         |
| PUT    | `/proveedores/:id`            | Actualizar proveedor      |
| DELETE | `/proveedores/:id`            | Eliminar proveedor        |


### Clientes

| Método | Ruta                                  | Descripción                                    |
| ------ | ------------------------------------- | -----------------------------------------------|
| GET    | `/clientes`                           | Listado de clientes                            |
| GET    | `/clientes/nuevo-cliente`             | Formulario nuevo cliente                       |
| POST   | `/clientes`                           | Crear cliente                                  |
| GET    | `/clientes/:id/editar`                | Formulario editar                              |
| PUT    | `/clientes/:id`                       | Actualizar cliente                             |
| DELETE | `/clientes/:id`                       | Eliminar cliente                               |
| GET    | `/clientes/:id/cuenta-corriente`      | Ver cuenta corriente                           |
| GET    | `/clientes/:id/cobrar`                | Formulario registrar cobro                     |
| POST   | `/clientes/:id/cobrar`                | Registrar cobro (acredita en cuenta corriente) |

### Lotes

| Método | Ruta                      | Descripción                                        |
|--------|---------------------------|----------------------------------------------------|
| GET    | `/lotes`                  | Listado de lotes con stock actual y vencimiento    |
| GET    | `/lotes/nuevo`            | Formulario nuevo lote                              |
| POST   | `/lotes`                  | Crear lote (número de lote formato AAA-YYYY-X)     |
| GET    | `/lotes/:id/editar`       | Editar lote (admin: todo; user: nro. lote y fecha) |
| POST   | `/lotes/:id/editar`       | Guardar cambios del lote                           |
| POST   | `/lotes/:id/eliminar`     | Eliminar lote (si no tiene ventas ni movimientos)  |
| GET    | `/lotes/:id/movimientos`  | Ver movimientos de stock del lote                  |

### Compras

| Método | Ruta                      | Descripción                                  |
| ------ | ------------------------- | -------------------------------------------- |
| GET    | `/compras`                | Listado de compras                           |
| GET    | `/compras/nueva`          | Formulario nueva compra                      |
| GET    | `/compras/ver/:id`        | Detalle de compra con items                  |
| POST   | `/compras/:id/recibir`    | Recibir compra: crea lotes, actualiza stock  |
| POST   | `/compras/:id/cancelar`   | Cancelar compra pendiente                    |

### Ventas

| Método | Ruta                       | Descripción                                           |
| ------ | -------------------------- | ----------------------------------------------------- |
| GET    | `/ventas`                  | Listado de ventas                                     |
| GET    | `/ventas/nueva`            | Formulario nueva venta                                |
| POST   | `/ventas`                  | Crear venta (valida stock FEFO y límite de crédito)   |
| GET    | `/ventas/ver/:id`          | Detalle de venta                                      |
| POST   | `/ventas/despachar/:id`    | Despachar venta: consume stock y registra movimientos |
| POST   | `/ventas/eliminar/:id`     | Cancelar venta pendiente                              |

### Cobranzas

| Método | Ruta              | Descripción                                       |
| ------ | ----------------- | ------------------------------------------------- |
| GET    | `/cobranzas`      | Listado de cobranzas                              |
| GET    | `/cobranzas/nueva`| Formulario nueva cobranza                         |
| POST   | `/cobranzas`      | Registrar cobranza (acredita en cuenta corriente) |


### Alertas

| Método | Ruta                                    | Descripción                                                                                          |
| ------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GET    | `/alertas`                              | Panel de alertas: stock bajo, lotes por vencer, clientes excedidos y revisiones de precio pendientes |
| POST   | `/alertas/revisiones/:id/resolver`      | Aplicar precio de venta sugerido y marcar revisión como resuelta                                     |

---

## API REST

Endpoints JSON para integración externa, todos bajo `/api/`:

| Módulo             | Base URL                  |
| ------------------ | ------------------------- |
| Productos          | `/api/productos`          |
| Proveedores        | `/api/proveedores`        |
| Clientes           | `/api/clientes`           |
| Ventas             | `/api/ventas`             |
| Lotes              | `/api/lotes`              |
| Compras            | `/api/compras`            |
| Movimientos        | `/api/movimientos-stock`  |
| Cuentas corrientes | `/api/cuentas-corrientes` |

---

## Lógica de negocio

- **FEFO (First Expired, First Out):** Al crear una venta, los lotes se asignan priorizando los de fecha de vencimiento más próxima.
- **Stock por lotes:** El stock no se carga directamente en el producto. Se ingresa mediante lotes, que se crean al recibir una compra. El stock del producto es la suma de todos sus lotes activos.
- **Número de lote:** Formato `SSSS-YYYY-NNN` (ej: `LIMP-2025-001`). El prefijo se genera automáticamente según la categoría del producto (`LIMP`, `DESI`, `GRAN`, `PAPE`, etc.) y el correlativo se consulta a la API para evitar duplicados. El campo es editable como fallback manual.
- **Cuenta Corriente:** Las ventas a cuenta corriente generan un débito (aumenta el saldo del cliente). Los cobros registrados generan un crédito (reduce el saldo). Las ventas al contado (efectivo / transferencia) generan un registro de tipo `ingreso` que queda en el historial sin modificar el saldo.
- **Límite de crédito:** Se valida al crear una venta con forma de pago `cuenta_corriente`.
- **Control de dependencias:** No se puede eliminar un cliente con ventas, un producto con lotes o ventas, un proveedor con compras activas, ni un lote con movimientos de stock o ventas pendientes.
- **IDs numéricos autoincrementales:** Todos los modelos usan `_id: Number` generado por el modelo `Contador` con `findOneAndUpdate + $inc`.
- **Roles:** El rol `admin` tiene acceso a edición completa de lotes y gestión de usuarios. El rol `user` opera el sistema sin poder modificar cantidades de stock directamente.
- **Actualización automática de precios al recibir compras:** Al recibir una compra, el `precio_costo` del producto se actualiza con el valor de la orden. Si el admin completó un precio de venta en el formulario, también se actualiza `precio_venta` directamente. Si no, el sistema genera una revisión pendiente con el precio sugerido (+40% del costo), visible en el panel de Alertas.
- **Revisiones de precio:** El modelo `RevisionPrecio` almacena las actualizaciones de costo que quedaron sin precio de venta definido. El admin las resuelve desde Alertas aplicando el precio sugerido o uno personalizado.
- **Validación de cheques:** No se acepta un cheque con fecha de vencimiento anterior a hoy menos 15 días, validado tanto en el frontend como en el backend.

---

## Tecnologías

| Tecnología           | Uso                                     |
| ---------------------| ----------------------------------------|
| Node.js + Express    | Servidor HTTP y routing                 |
| MongoDB Atlas        | Base de datos en la nube                |
| Mongoose             | ODM para MongoDB                        |
| Pug                  | Motor de plantillas (vistas)            |
| bcrypt               | Hash de contraseñas                     |
| jsonwebtoken         | Generación y verificación de tokens JWT |
| express-session      | Manejo de sesiones                      |
| cookie-parser        | Lectura de cookies (para verificar JWT) |
| dotenv               | Variables de entorno                    |
| CORS                 | Acceso desde otros orígenes             |
| Render               | Hosting en la nube                      |
| nodemon              | Recarga automática en desarrollo        |
| Socket.IO            | Chat en tiempo real (WebSockets)        |
| Google Generative AI | Asistente de chat con Gemini            |


## Decisiones de diseño

- **Sesiones en lugar de JWT:** Se optó por `express-session` para el manejo de autenticación dado que la aplicación es server-side rendering con Pug. JWT es más adecuado para APIs stateless o SPAs; en este caso las sesiones resultan más simples y seguras para el flujo de vistas.
- **IDs numéricos:** Se usaron IDs numéricos autoincrementales en lugar de ObjectId de MongoDB para facilitar la lectura y referencia entre documentos en las vistas.
- **Sin transacciones:** Las operaciones que involucran múltiples colecciones (ej: crear venta + actualizar lote + registrar movimiento) usan `async/await` con `try/catch` sin transacciones MongoDB, dado que el plan gratuito de Atlas no garantiza replica set. Esta limitación está documentada como decisión consciente.

---

## Repositorio

[GitHub — TodoStock](https://github.com/ferffloress/todostock.git)