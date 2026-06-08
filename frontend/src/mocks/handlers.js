// Mock data for LoginPortal tests
export const mockStudents = [
  { _id: 'est001', nombre: 'Juan Pérez' },
  { _id: 'est002', nombre: 'María García' },
  { _id: 'est003', nombre: 'Carlos López' },
];

export const mockDocentes = [
  { _id: 'doc001', nombre: 'Dr. Thompson' },
  { _id: 'doc002', nombre: 'Dra. Smith' },
];

// Handlers for MSW (Mock Service Worker)
// NOTE: These would be used in a real application with setupServer from 'msw/node'
// Example usage in your test file:
// import { setupServer } from 'msw/node';
// import { http, HttpResponse } from 'msw';
// 
// export const handlers = [
//   http.get('/api/estudiantes', () => HttpResponse.json(mockStudents)),
//   http.get('/api/docentes', () => HttpResponse.json(mockDocentes)),
//   http.post('/api/login', async ({ request }) => {
//     const body = await request.json();
//     if (body.user === 'admin' && body.pass === 'admin') {
//       return HttpResponse.json({ role: 'administrador', success: true });
//     }
//     return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//   }),
// ];
//
// const server = setupServer(...handlers);
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());


