const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data) {
  const errors = [];

  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
    errors.push('nombre es requerido y debe ser un texto');
  }

  if (!data.cuit || typeof data.cuit !== 'string' || data.cuit.trim() === '') {
    errors.push('cuit es requerido');
  } else if (!CUIT_REGEX.test(data.cuit.trim())) {
    errors.push('cuit debe tener el formato XX-XXXXXXXX-X');
  }

  if (data.telefono !== undefined && data.telefono !== null && data.telefono !== '') {
    if (typeof data.telefono !== 'string') {
      errors.push('telefono debe ser un texto');
    }
  }

  if (data.email !== undefined && data.email !== null && data.email !== '') {
    if (typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
      errors.push('email debe tener un formato válido');
    }
  }

  return { errors };
}

module.exports = { validate };
