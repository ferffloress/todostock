function validate(data) {
  const errors = [];

  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
    errors.push('nombre es requerido y debe ser un texto');
  }

  if (!data.categoria || typeof data.categoria !== 'string' || data.categoria.trim() === '') {
    errors.push('categoria es requerida y debe ser un texto');
  }

  if (data.precio_costo === undefined || data.precio_costo === null) {
    errors.push('precio_costo es requerido');
  } else if (typeof data.precio_costo !== 'number' || data.precio_costo <= 0) {
    errors.push('precio_costo debe ser un número positivo');
  }

  if (data.precio_venta === undefined || data.precio_venta === null) {
    errors.push('precio_venta es requerido');
  } else if (typeof data.precio_venta !== 'number' || data.precio_venta <= 0) {
    errors.push('precio_venta debe ser un número positivo');
  } else if (
    typeof data.precio_costo === 'number' &&
    data.precio_costo > 0 &&
    data.precio_venta < data.precio_costo
  ) {
    errors.push('precio_venta debe ser mayor o igual a precio_costo');
  }

  if (data.stock_actual === undefined || data.stock_actual === null) {
    errors.push('stock_actual es requerido');
  } else if (typeof data.stock_actual !== 'number' || data.stock_actual < 0) {
    errors.push('stock_actual debe ser un número no negativo');
  }

  if (data.stock_minimo === undefined || data.stock_minimo === null) {
    errors.push('stock_minimo es requerido');
  } else if (typeof data.stock_minimo !== 'number' || data.stock_minimo < 0) {
    errors.push('stock_minimo debe ser un número no negativo');
  }

  if (!data.unidad_medida || typeof data.unidad_medida !== 'string' || data.unidad_medida.trim() === '') {
    errors.push('unidad_medida es requerida y debe ser un texto');
  }

  return { errors };
}

module.exports = { validate };
