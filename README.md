# TodoStock S.A. — Backend REST

Backend REST para **TodoStock S.A.**, distribuidora mayorista de productos de limpieza.  
Desarrollado con **Node.js**, **Express** y **MongoDB** (Mongoose). Incluye vistas renderizadas con **Pug** y autenticación con **express-session** + **bcrypt**.

---

## Demo en producción

**URL:** https://todostock-99j7.onrender.com  
**Usuario:** `usuario` | **Contraseña:** `123456`

> El servidor es de plan gratuito (Render). Si no responde en el primer intento, esperá 30 segundos — se reactiva automáticamente.

---

## Requisitos

- Node.js v18 o superior
- npm
- MongoDB local (v6+) o una URI de MongoDB Atlas

---

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```
MONGODB_URI=mongodb://127.0.0.1:27017/todoStock
PORT=3000
SESSION_SECRET=cambiar_por_una_clave_secreta_segura
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
│   ├── controllers/    → lógica de negocio y respuestas HTTP
│   ├── routes/         → definición de endpoints (vistas + API REST)
│   ├── validators/     → validaciones de datos de entrada
│   ├── views/          → plantillas Pug (interfaz web)
│   └── data/           → archivos JSON originales (usados por seed.js)
├── package.json
└── .gitignore
```

---

## Autenticación

El sistema usa **express-session** con contraseñas hasheadas con **bcrypt**.

| Método | Ruta       | Descripción                        |
| ------ | ---------- | ---------------------------------- |
| GET    | `/login`   | Formulario de login                |
| POST   | `/login`   | Iniciar sesión                     |
| POST   | `/logout`  | Cerrar sesión                      |

Todas las rutas están protegidas. Sin sesión activa, redirige a `/login`.

---

## Rutas de vistas (interfaz web)

### Productos

| Método | Ruta                        | Descripción                   |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/productos`                | Listado de productos          |
| GET    | `/productos/nuevo`          | Formulario nuevo producto     |
| POST   | `/productos`                | Crear producto (+ lote inicial si stock > 0) |
| GET    | `/productos/:id/editar`     | Formulario editar             |
| PUT    | `/productos/:id`            | Actualizar producto           |
| DELETE | `/productos/:id`            | Eliminar producto             |

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

| Método | Ruta                                  | Descripción                |
| ------ | ------------------------------------- | -------------------------- |
| GET    | `/clientes`                           | Listado de clientes        |
| GET    | `/clientes/nuevo-cliente`             | Formulario nuevo cliente   |
| POST   | `/clientes`                           | Crear cliente              |
| GET    | `/clientes/:id/editar`                | Formulario editar          |
| PUT    | `/clientes/:id`                       | Actualizar cliente         |
| DELETE | `/clientes/:id`                       | Eliminar cliente           |
| GET    | `/clientes/:id/cuenta-corriente`      | Ver cuenta corriente       |

### Lotes

| Método | Ruta                           | Descripción                        |
| ------ | ------------------------------ | ---------------------------------- |
| GET    | `/lotes`                       | Listado de lotes                   |
| GET    | `/lotes/nuevo`                 | Formulario nuevo lote              |
| POST   | `/lotes`                       | Crear lote                         |
| GET    | `/lotes/:id/movimientos`       | Ver movimientos de stock del lote  |

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

---

## API REST

Endpoints JSON para integración externa, todos bajo `/api/`:

| Módulo           | Base URL                  |
| ---------------- | ------------------------- |
| Productos        | `/api/productos`          |
| Proveedores      | `/api/proveedores`        |
| Clientes         | `/api/clientes`           |
| Ventas           | `/api/ventas`             |
| Lotes            | `/api/lotes`              |
| Compras          | `/api/compras`            |
| Movimientos      | `/api/movimientos-stock`  |
| Cuentas corrientes | `/api/cuentas-corrientes` |

---

## Lógica de negocio

- **FEFO (First Expired, First Out):** Al crear una venta, los lotes se asignan priorizando los de fecha de vencimiento más próxima.
- **Lote automático:** Al crear un producto con `stock_actual > 0`, se genera un lote inicial automáticamente.
- **Cuenta Corriente:** Los débitos aumentan el saldo (ventas); los créditos lo reducen (cobranzas).
- **Límite de crédito:** Se valida al crear una venta con forma de pago `cuenta_corriente`.
- **Control de dependencias:** No se puede eliminar un cliente con ventas, ni un producto con ventas o lotes, ni un proveedor con compras activas.
- **IDs numéricos auto-increment:** Todos los modelos usan un campo `_id: Number` generado por el modelo `Contador`.

---

## Tecnologías

| Tecnología       | Uso                              |
| ---------------- | -------------------------------- |
| Node.js + Express| Servidor HTTP y routing          |
| MongoDB + Mongoose | Base de datos y ODM            |
| Pug              | Motor de plantillas (vistas)     |
| bcrypt           | Hash de contraseñas              |
| express-session  | Manejo de sesiones               |
| dotenv           | Variables de entorno             |
| CORS             | Acceso desde otros orígenes      |
| Render           | Hosting en la nube               |
| MongoDB Atlas    | Base de datos en la nube         |
