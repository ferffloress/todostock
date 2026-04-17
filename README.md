# TodoStock S.A. — Backend REST

Backend REST para **TodoStock S.A.**, distribuidora mayorista de productos de limpieza. Desarrollado con Node.js y Express. Los datos se guardan en archivos JSON para que persistan al reiniciar el servidor.

---

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev
```

El servidor levanta en `http://localhost:3000`.

Al iniciar se ejecuta automaticamente el seed que precarga datos de prueba.

---

## Estructura del proyecto

```
src/
├── models/          -> clases con constructor para cada entidad
├── controllers/     -> logica de negocio y respuestas JSON
├── routes/          -> definicion de endpoints
├── data/            -> archivos JSON donde se guardan los datos
└── index.js
app.js
package.json
```

---

## Modulos

| Modulo | Descripcion |
|--------|-------------|
| **models/** | Clases con constructor para cada entidad del sistema |
| **controllers/** | Logica de negocio: CRUD, validaciones, control de stock, FEFO, cuentas corrientes |
| **routes/** | Definicion de rutas y metodos HTTP |
| **data/** | Archivos JSON con los datos persistidos |
| **seed.js** | Datos de prueba: 3 proveedores, 5 productos, 10 lotes, 3 clientes, 1 compra recibida, 1 venta despachada |

---

## Endpoints

### Productos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/productos` | Listar todos los productos |
| GET | `/productos/:id` | Obtener producto por ID |
| POST | `/productos` | Crear producto |
| PUT | `/productos/:id` | Actualizar producto |
| DELETE | `/productos/:id` | Eliminar producto |

### Proveedores

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/proveedores` | Listar todos los proveedores |
| GET | `/proveedores/:id` | Obtener proveedor por ID |
| POST | `/proveedores` | Crear proveedor |
| PUT | `/proveedores/:id` | Actualizar proveedor |
| DELETE | `/proveedores/:id` | Eliminar proveedor |

### Clientes

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/clientes` | Listar todos los clientes |
| GET | `/clientes/:id` | Obtener cliente por ID |
| POST | `/clientes` | Crear cliente |
| PUT | `/clientes/:id` | Actualizar cliente |
| DELETE | `/clientes/:id` | Eliminar cliente |

### Lotes

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/lotes` | Listar todos los lotes |
| GET | `/lotes/:id` | Obtener lote por ID |
| GET | `/lotes/producto/:producto_id` | Listar lotes de un producto |

### Compras

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/compras` | Listar todas las compras |
| GET | `/compras/:id` | Obtener compra por ID |
| POST | `/compras` | Crear compra |
| PATCH | `/compras/:id/recibir` | Recibir compra: crea lotes, actualiza stock |
| PATCH | `/compras/:id/cancelar` | Cancelar compra pendiente |

### Ventas

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/ventas` | Listar todas las ventas |
| GET | `/ventas/:id` | Obtener venta por ID con datos del cliente y productos |
| POST | `/ventas` | Crear venta (valida stock y limite de credito, asigna lotes por FEFO) |
| PATCH | `/ventas/:id/despachar` | Despachar venta: consume stock y registra movimientos |
| PATCH | `/ventas/:id/cancelar` | Cancelar venta pendiente |

### Movimientos de Stock

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/movimientos-stock` | Listar todos los movimientos |
| GET | `/movimientos-stock/producto/:producto_id` | Listar movimientos de un producto |

### Cuentas Corrientes

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/cuentas-corrientes/:cliente_id` | Ver cuenta corriente del cliente |

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
  "contacto": "Pedro Ramirez",
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

---

## Logica de negocio

- **FEFO:** Al crear una venta los lotes se asignan priorizando los de fecha de vencimiento mas proxima.
- **Cuenta Corriente:** Los debitos aumentan el saldo (ventas despachadas), los creditos lo reducen (cobranzas).
- **Limite de credito:** Se valida al crear la venta. Si el saldo mas el total de la venta supera el limite, la venta es rechazada.
- **Control de dependencias:** No se puede eliminar un cliente con ventas activas, ni un producto q este en ventas o compras activas, ni un proveedor con compras activas.
