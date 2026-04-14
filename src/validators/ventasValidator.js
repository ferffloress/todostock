function validate(data) {
  const errors = [];

  if (!data.cliente_id || typeof data.cliente_id !== 'string' || data.cliente_id.trim() === '') {
    errors.push('cliente_id es requerido');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items es requerido y debe ser un array no vacío');
  } else {
    data.items.forEach((item, index) => {
      const prefix = `items[${index}]`;

      if (!item.producto_id || typeof item.producto_id !== 'string' || item.producto_id.trim() === '') {
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
    });
  }

  return { errors };
}

module.exports = { validate };
