/**
 * Middlewares de Seguridad para mitigación de OWASP Top 10 (2025)
 */

/**
 * Sanitiza recursivamente objetos contra inyección de operadores NoSQL de MongoDB.
 * Elimina cualquier clave que empiece con "$" o que contenga puntos ".".
 * @param {*} obj Objeto a sanitizar (body, query, params)
 */
export function sanitizeNoSQL(obj) {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith('$') || key.includes('.')) {
          console.warn(`[SECURITY WARN] Clave sospechosa detectada y eliminada: ${key}`);
          delete obj[key];
        } else {
          sanitizeNoSQL(obj[key]);
        }
      }
    }
  }
  return obj;
}

/**
 * Middleware express para sanitización automática de NoSQL.
 */
export function noSQLSanitizer(req, res, next) {
  if (req.body) sanitizeNoSQL(req.body);
  if (req.query) sanitizeNoSQL(req.query);
  if (req.params) sanitizeNoSQL(req.params);
  next();
}

/**
 * Controlador de errores de producción para evitar fuga de información sensible.
 * Oculta los stack traces detallados en producción.
 */
export function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === 'production';
  console.error('[SERVER ERROR]', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Ha ocurrido un error interno en el servidor.' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
}
