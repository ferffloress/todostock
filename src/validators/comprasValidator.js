function isValidISODate(str) {
  if (typeof str !== 'string') return false;
  const d = new Date(str);
  return !isNaN(d.getTime());
}

function validate(data) {
  const errors = [];

  if (data.proveedor_id === undefined || data.proveedor_id === null || data.proveedor_id === '') {
    errors.push('proveedor_id es requerido');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items es requerido y debe ser un array no vacío');
  } else {
    data.items.forEach((item, index) => {
      const prefix = `items[${index}]`;

      if (item.producto_id === undefined || item.producto_id === null || item.producto_id === '') {
        errors.push(`${prefix}.producto_id es requerido`);
      }

      if (item.cantidad === undefined || item.cantidad === null) {
        errors.push(`${prefix}.cantidad es requerida`);
      } else if (typeof item.cantidad !== 'number' || item.cantidad <= 0) {
        errors.push(`${prefix}.cantidad debe ser un número positivo`);
      }

      if (item.precio_unitario === undefined || item.precio_unitario === null) {
        errors.push(`${prefix}.precio_unitario es requerido`);
      } else if (typeof item.precio_unitario !== 'number' || item.precio_unitario <= 0) {
        errors.push(`${prefix}.precio_unitario debe ser un número positivo`);
      }

     if (item.lote_id === undefined || item.lote_id === null || item.lote_id === '') {
        errors.push(`${prefix}.lote_id es requerido`);
      }
    });
  }

  return { errors };
}

module.exports = { validate };
