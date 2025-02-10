import { PropsWithChildren, ReactNode } from 'react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';
import { mockedUseNavigate } from './utils';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('@auth0/auth0-react', () => {
  return {
    useAuth0: vi.fn().mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    }),
    Auth0Provider: ({ children }: PropsWithChildren) => children,
    withAuthenticationRequired: (component: ReactNode) => component,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});
