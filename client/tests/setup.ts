import { PropsWithChildren, ReactNode } from 'react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';
import { mockedUseNavigate, mockedUseParams } from './utils';
import useStore from '../src/store/useStore';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Reset Zustand store state before each test
beforeEach(() => {
  useStore.setState({
    activeBoard: null,
    subtasksToRemove: [],
  });
});

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
    useParams: mockedUseParams,
  };
});

vi.mock('zustand', () => ({
  create: vi.fn((store) => store()),
}));

// Mock Zustand store
vi.mock('../src/store/useStore.ts', async () => {
  const actualCreate = (await vi.importActual<typeof import('zustand')>('zustand')).create;

  return {
    default: actualCreate(() => ({
      activeBoard: null,
      subtasksToRemove: [],
      setActiveBoard: vi.fn(),
      setSubtasksToRemove: vi.fn(),
    })),
  };
});
