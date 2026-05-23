# TodoStock S.A. — Backend REST

Backend REST para **TodoStock S.A.**, distribuidora mayorista de productos de limpieza.  
Desarrollado con **Node.js**, **Express** y **MongoDB** (Mongoose). Incluye vistas renderizadas con **Pug**.

---

## Requisitos

- Node.js v18 o superior
- npm
- MongoDB local (v6 o superior) o una URI de MongoDB Atlas

---

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
MONGODB_URI=mongodb://127.0.0.1:27017/todoStock
```

Si usás MongoDB Atlas, reemplazá el valor por tu URI de conexión.  
Si no creás el archivo `.env`, el sistema usa `mongodb://127.0.0.1:27017/todoStock` por defecto.

## Carga inicial de datos (Seed)

Para importar los datos de prueba a MongoDB ejecutar una sola vez:

```bash
node seed.js
```

Esto elimina los datos existentes e inserta los registros de prueba en todas las colecciones.

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
│   ├── services/       → lógica de negocio reutilizable
│   ├── views/          → plantillas Pug
│   └── data/           → archivos JSON originales (usados por seed.js)
├── package.json
└── .gitignore
```

---

## Módulos

| Módulo         | Descripción                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `models/`      | Esquemas Mongoose con validaciones de tipos y restricciones por entidad                           |
| `controllers/` | Lógica de negocio: CRUD, validaciones, control de stock, FEFO, cuentas corrientes                 |
| `routes/`      | Definición de rutas y métodos HTTP (vistas HTML + endpoints API REST)                             |
| `validators/`  | Validación de campos requeridos y tipos en el body de cada request                                |
| `services/`    | Lógica reutilizable desacoplada de los controladores                                              |
| `data/`        | Archivos JSON con datos de prueba, utilizados por seed.js para poblar MongoDB                     |

---

## Endpoints

### Productos

| Método | Ruta             | Descripción                |
| ------ | ---------------- | -------------------------- |
| GET    | `/productos`     | Listar todos los productos |
| GET    | `/productos/:id` | Obtener producto por ID    |
| POST   | `/productos`     | Crear producto             |
| PUT    | `/productos/:id` | Actualizar producto        |
| DELETE | `/productos/:id` | Eliminar producto          |

### Proveedores

| Método | Ruta               | Descripción                  |
| ------ | ------------------ | ---------------------------- |
| GET    | `/proveedores`     | Listar todos los proveedores |
| GET    | `/proveedores/:id` | Obtener proveedor por ID     |
| POST   | `/proveedores`     | Crear proveedor              |
| PUT    | `/proveedores/:id` | Actualizar proveedor         |
| DELETE | `/proveedores/:id` | Eliminar proveedor           |

### Clientes

| Método | Ruta            | Descripción               |
| ------ | --------------- | ------------------------- |
| GET    | `/clientes`     | Listar todos los clientes |
| GET    | `/clientes/:id` | Obtener cliente por ID    |
| POST   | `/clientes`     | Crear cliente             |
| PUT    | `/clientes/:id` | Actualizar cliente        |
| DELETE | `/clientes/:id` | Eliminar cliente          |

### Lotes

| Método | Ruta                           | Descripción                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/lotes`                       | Listar todos los lotes      |
| GET    | `/lotes/:id`                   | Obtener lote por ID         |
| GET    | `/lotes/producto/:producto_id` | Listar lotes de un producto |

### Compras

| Método | Ruta                    | Descripción                                 |
| ------ | ----------------------- | ------------------------------------------- |
| GET    | `/compras`              | Listar todas las compras                    |
| GET    | `/compras/:id`          | Obtener compra por ID                       |
| POST   | `/compras`              | Crear compra                                |
| PATCH  | `/compras/:id/recibir`  | Recibir compra: crea lotes, actualiza stock |
| PATCH  | `/compras/:id/cancelar` | Cancelar compra pendiente                   |

### Ventas

| Método | Ruta                    | Descripción                                                           |
| ------ | ----------------------- | --------------------------------------------------------------------- |
| GET    | `/ventas`               | Listar todas las ventas                                               |
| GET    | `/ventas/:id`           | Obtener venta por ID con datos del cliente y productos                |
| POST   | `/ventas`               | Crear venta (valida stock y límite de crédito, asigna lotes por FEFO) |
| PATCH  | `/ventas/:id/despachar` | Despachar venta: consume stock y registra movimientos                 |
| PATCH  | `/ventas/:id/cancelar`  | Cancelar venta pendiente                                              |

### Cobranzas

| Método | Ruta             | Descripción                                              |
| ------ | ---------------- | -------------------------------------------------------- |
| GET    | `/cobranzas`     | Listar todas las cobranzas                               |
| GET    | `/cobranzas/:id` | Obtener cobranza por ID                                  |
| POST   | `/cobranzas`     | Registrar cobranza (acredita en cuenta corriente)        |

### Movimientos de Stock

| Método | Ruta                                       | Descripción                       |
| ------ | ------------------------------------------ | --------------------------------- |
| GET    | `/movimientos-stock`                       | Listar todos los movimientos      |
| GET    | `/movimientos-stock/producto/:producto_id` | Listar movimientos de un producto |

### Alertas

| Método | Ruta       | Descripción                                                                         |
| ------ | ---------- | ----------------------------------------------------------------------------------- |
| GET    | `/alertas` | Productos con stock bajo, lotes por vencer en 30 días y clientes con saldo excedido |

### Resúmenes

| Método | Ruta                    | Descripción                                              |
| ------ | ----------------------- | -------------------------------------------------------- |
| GET    | `/resumen/inventario`   | Valor del inventario, productos sin stock y sobrestock   |
| GET    | `/resumen/caja`         | Ventas, cobros y compras del mes corriente               |
| GET    | `/resumen/ventas`       | Top 5 productos y clientes, ventas por semana            |

---

## Ejemplos de uso

### POST /productos

```json
{
  "nombre": "Lavandina 10L",
  "categoria": "Desinfectantes",
  "precio_costo": 850,
  "precio_venta": 1200,
  "stock_actual": 0,
  "stock_minimo": 50,
  "unidad_medida": "unidad"
}
```

### POST /clientes

```json
{
  "nombre": "Supermercado El Ahorro",
  "cuit": "20-11111111-1",
  "contacto": "Pedro Ramírez",
  "telefono": "011-5555-6666",
  "email": "compras@elahorro.com",
  "limite_credito": 500000
}
```

### POST /compras

```json
{
  "proveedor_id": "<id-del-proveedor>",
  "items": [
    {
      "producto_id": "<id-del-producto>",
      "cantidad": 100,
      "precio_unitario": 850,
      "numero_lote": "LAV-2025-03",
      "fecha_vencimiento": "2026-06-01T00:00:00.000Z"
    }
  ]
}
```

### POST /ventas

```json
{
  "cliente_id": "<id-del-cliente>",
  "items": [
    {
      "producto_id": "<id-del-producto>",
      "cantidad": 20,
      "precio_unitario": 1200
    }
  ]
}
```

### POST /cobranzas

```json
{
  "cliente_id": "<id-del-cliente>",
  "monto": 50000
}
```

---

## Lógica de negocio

- **FEFO (First Expired, First Out):** Al crear una venta, los lotes se asignan priorizando los de fecha de vencimiento más próxima.
- **Cuenta Corriente:** Los débitos aumentan el saldo (ventas despachadas); los créditos lo reducen (cobranzas registradas).
- **Límite de crédito:** Se valida al crear la venta. Si el saldo más el total de la venta supera el límite, la venta es rechazada.
- **Control de dependencias:** No se puede eliminar un cliente con ventas activas, ni un producto en ventas o compras activas, ni un proveedor con compras activas.
