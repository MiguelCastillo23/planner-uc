export const calcularFinSesion = (horaInicio) => {
  const [horas, minutos] = horaInicio.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas, minutos, 0);
  
  // Sumar 90 minutos de clase
  const fechaFin = new Date(fecha.getTime() + 90 * 60000);
  
  // Retornar formato HH:mm
  return fechaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const validarMargen11Min = (horaFinAnterior, horaInicioSiguiente) => {
  const fin = new Date(`2024-01-01 ${horaFinAnterior}`);
  const inicio = new Date(`2024-01-01 ${horaInicioSiguiente}`);
  const diffMs = inicio - fin;
  return diffMs >= 11 * 60000; // true si hay al menos 11 min
};
