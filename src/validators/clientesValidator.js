function validate(data) {
  const errors = [];

  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
    errors.push('nombre es requerido y debe ser un texto');
  }

  if (!data.cuit || typeof data.cuit !== 'string' || data.cuit.trim() === '') {
    errors.push('cuit es requerido');
  }

  if (data.limite_credito === undefined || data.limite_credito === null) {
    errors.push('limite_credito es requerido');
  } else if (typeof data.limite_credito !== 'number' || data.limite_credito <= 0) {
    errors.push('limite_credito debe ser un número positivo');
  }

  return { errors };
}

module.exports = { validate };
