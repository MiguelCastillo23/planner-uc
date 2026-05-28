import { co2 } from '@tgwf/co2';
import EnvironmentalMetric from '../models/EnvironmentalMetric.js';

// Usamos el modelo 'swd' (Sustainable Web Design)
const swd = new co2({ model: 'swd' });

export const environmentalTracker = (req, res, next) => {
  const start = Date.now();
  let bytesTransferred = 0;

  // Interceptamos res.write para contar los bytes reales (útil cuando hay compresión)
  const originalWrite = res.write;
  res.write = function (chunk, encoding, callback) {
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        bytesTransferred += chunk.length;
      } else if (typeof chunk === 'string') {
        bytesTransferred += Buffer.byteLength(chunk, encoding || 'utf8');
      }
    }
    return originalWrite.apply(this, arguments);
  };

  // Interceptamos res.end para contar los bytes del bloque final
  const originalEnd = res.end;
  res.end = function (chunk, encoding, callback) {
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        bytesTransferred += chunk.length;
      } else if (typeof chunk === 'string') {
        bytesTransferred += Buffer.byteLength(chunk, encoding || 'utf8');
      }
    }
    return originalEnd.apply(this, arguments);
  };

  // Se ejecuta justo cuando la respuesta ha terminado de enviarse al cliente
  res.on('finish', async () => {
    // Evitamos medir la ruta del dashboard
    if (req.originalUrl === '/environmental-impact' || req.path === '/environmental-impact') {
        return;
    }

    const responseTime = Date.now() - start;

    // Si por alguna razón no se interceptaron bytes en el stream, usamos el content-length
    if (bytesTransferred === 0) {
      const headerLength = res.getHeader('content-length');
      bytesTransferred = headerLength ? parseInt(headerLength, 10) : 0;
    }

    // Calculamos el CO2 en base a los bytes reales transferidos
    const co2Emissions = swd.perByte(bytesTransferred);

    try {
      await EnvironmentalMetric.create({
        method: req.method,
        path: req.originalUrl || req.path,
        status: res.statusCode,
        responseTime,
        bytesTransferred,
        co2Emissions
      });
    } catch (err) {
      console.error('Error guardando métrica ambiental:', err);
    }
  });

  next();
};
