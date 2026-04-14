const FORMAS_PAGO_VALIDAS = ['efectivo', 'transferencia', 'cheque'];

function validate(data) {
  const errors = [];

  if (!data.cliente_id || typeof data.cliente_id !== 'string' || data.cliente_id.trim() === '') {
    errors.push('cliente_id es requerido');
  }

  if (data.monto === undefined || data.monto === null) {
    errors.push('monto es requerido');
  } else if (typeof data.monto !== 'number' || data.monto <= 0) {
    errors.push('monto debe ser un número positivo');
  }

  if (!data.forma_pago || typeof data.forma_pago !== 'string' || data.forma_pago.trim() === '') {
    errors.push('forma_pago es requerida');
  } else if (!FORMAS_PAGO_VALIDAS.includes(data.forma_pago.trim())) {
    errors.push(`forma_pago debe ser uno de: ${FORMAS_PAGO_VALIDAS.join(', ')}`);
  }

  return { errors };
}

module.exports = { validate };
