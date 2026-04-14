# TodoStock S.A. — Backend REST

Backend REST para **TodoStock S.A.**, distribuidora mayorista de productos de limpieza. Desarrollado con Node.js y Express. Todos los datos se almacenan en memoria (no requiere base de datos), con arquitectura diseñada para migración sencilla a MongoDB.

---

## Instalación

```bash
cd todostock
npm install
```

## Ejecución

```bash
# Producción
npm start

# Desarrollo (con hot reload via nodemon)
npm run dev
```

El servidor levanta en `http://localhost:3000` (o en el puerto definido por la variable de entorno `PORT`).

Al iniciar, se ejecuta automáticamente el **seed** que precarga datos de prueba en memoria.

---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **storage/** | Capa de persistencia en memoria usando `Map`. Interfaz común: `getAll`, `getById`, `create`, `update`, `delete`, `findWhere`. Diseñada para reemplazar fácilmente por repositorios MongoDB. |
| **validators/** | Validación manual de datos de entrada (sin dependencias externas). Retornan `{ errors: string[] }`. |
| **services/** | Lógica de negocio: CRUD, control de stock, FEFO, cuentas corrientes, alertas, resúmenes. |
| **routes/** | Controladores Express. Llaman a servicios y devuelven respuestas JSON. |
| **seed.js** | Datos de prueba precargados al iniciar: 3 proveedores, 5 productos, 10 lotes, 3 clientes, 1 compra recibida, 1 venta despachada. |

---

## Endpoints

### Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/productos` | Listar todos los productos |
| GET | `/productos/:id` | Obtener producto por ID |
| POST | `/productos` | Crear producto |
| PUT | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Eliminar producto |

### Proveedores

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/proveedores` | Listar todos los proveedores |
| GET | `/proveedores/:id` | Obtener proveedor por ID |
| POST | `/proveedores` | Crear proveedor |
| PUT | `/proveedores/:id` | Actualizar proveedor |
| DELETE | `/proveedores/:id` | Eliminar proveedor |

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/clientes` | Listar todos los clientes |
| GET | `/clientes/:id` | Obtener cliente por ID |
| POST | `/clientes` | Crear cliente |
| PUT | `/clientes/:id` | Actualizar cliente |
| DELETE | `/clientes/:id` | Eliminar cliente |
| GET | `/clientes/:id/cuenta-corriente` | Ver cuenta corriente del cliente (saldo + movimientos) |

### Lotes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lotes` | Listar todos los lotes |
| GET | `/lotes/:id` | Obtener lote por ID |
| GET | `/lotes/producto/:producto_id` | Listar lotes de un producto |

### Compras

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/compras` | Listar todas las compras |
| GET | `/compras/:id` | Obtener compra por ID |
| POST | `/compras` | Crear compra (estado: pendiente) |
| PATCH | `/compras/:id/recibir` | Recibir compra: crea lotes, actualiza stock, registra movimientos |
| PATCH | `/compras/:id/cancelar` | Cancelar compra pendiente |

### Ventas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/ventas` | Listar todas las ventas |
| GET | `/ventas/:id` | Obtener venta por ID |
| POST | `/ventas` | Crear venta (valida stock y límite de crédito, asigna lotes por FEFO) |
| PATCH | `/ventas/:id/despachar` | Despachar venta: consume stock, registra movimientos y débito en cuenta corriente |
| PATCH | `/ventas/:id/cancelar` | Cancelar venta pendiente |

### Cobranzas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/cobranzas` | Listar todas las cobranzas |
| GET | `/cobranzas/:id` | Obtener cobranza por ID |
| POST | `/cobranzas` | Registrar cobro (genera crédito en cuenta corriente) |

### Movimientos de Stock

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/movimientos-stock` | Listar todos los movimientos |
| GET | `/movimientos-stock/producto/:producto_id` | Listar movimientos de un producto |

### Alertas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/alertas` | Obtener alertas: stock bajo, lotes por vencer (30 días), clientes con crédito excedido |

### Resúmenes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/resumen/inventario` | Resumen de inventario: valor de stock, sin stock, sobrestock, lotes por vencer |
| GET | `/resumen/caja` | Resumen de caja del mes: ventas, cobros, compras, deudores |
| GET | `/resumen/ventas` | Estadísticas de ventas: top 5 productos, top 5 clientes, ventas por semana |

---

## Ejemplos de cuerpos JSON

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

### POST /proveedores

```json
{
  "nombre": "Química del Sur S.A.",
  "cuit": "30-12345678-9",
  "contacto": "Juan Pérez",
  "telefono": "011-4444-5555",
  "email": "ventas@quimicadelsur.com",
  "condicion_pago": "30 días"
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
  "proveedor_id": "<uuid-del-proveedor>",
  "observaciones": "Pedido mensual",
  "items": [
    {
      "producto_id": "<uuid-del-producto>",
      "cantidad": 100,
      "precio_unitario": 850,
      "numero_lote": "LAV-2025-03",
      "fecha_vencimiento": "2026-06-01T00:00:00.000Z"
    }
  ]
}
```

### PATCH /compras/:id/recibir

No requiere cuerpo. La compra debe estar en estado `pendiente`.

```
PATCH /compras/abc123/recibir
```

### POST /ventas

```json
{
  "cliente_id": "<uuid-del-cliente>",
  "observaciones": "Pedido urgente",
  "items": [
    {
      "producto_id": "<uuid-del-producto>",
      "cantidad": 20,
      "precio_unitario": 1200
    }
  ]
}
```

### PATCH /ventas/:id/despachar

No requiere cuerpo. La venta debe estar en estado `pendiente`.

```
PATCH /ventas/xyz789/despachar
```

### POST /cobranzas

```json
{
  "cliente_id": "<uuid-del-cliente>",
  "monto": 24000,
  "forma_pago": "transferencia",
  "observaciones": "Pago factura 0001-00000123"
}
```

Formas de pago válidas: `efectivo`, `transferencia`, `cheque`.

---

## Lógica de negocio clave

- **FEFO (First Expired, First Out):** Al crear una venta, los lotes se asignan priorizando los de fecha de vencimiento más próxima. El consumo efectivo ocurre al despachar.
- **Cuenta Corriente:** El saldo representa lo que el cliente debe. Los débitos (ventas despachadas) lo aumentan; los créditos (cobranzas) lo reducen. Puede ser negativo (saldo a favor del cliente).
- **Límite de crédito:** Se valida al crear la venta. Si `saldo_actual + total_venta > limite_credito`, la venta es rechazada.
- **Alertas automáticas:** `GET /alertas` devuelve en tiempo real productos con stock bajo, lotes próximos a vencer (≤ 30 días) y clientes con crédito excedido.

---

## Migración a MongoDB

Cada archivo en `storage/` puede reemplazarse por un repositorio Mongoose sin modificar servicios ni rutas. La interfaz (`getAll`, `getById`, `create`, `update`, `delete`, `findWhere`) es idéntica, solo cambia la implementación interna.
