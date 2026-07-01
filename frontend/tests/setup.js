import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server.js';

// MSW lifecycle management
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock browser confirm and alert dialogs since they block execution
window.confirm = vi.fn(() => true);
window.alert = vi.fn();
