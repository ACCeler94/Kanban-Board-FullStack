import { useAuth0 } from '@auth0/auth0-react';

type PartialAuth0Context = Partial<ReturnType<typeof useAuth0>>;

export const mockAuth0Logout = vi.fn();
export const mockLoginWithRedirect = vi.fn();

export const mockAuthState = (authStateOverrides: PartialAuth0Context) => {
  const defaultAuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: undefined,
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
    getAccessTokenWithPopup: vi.fn(),
    getIdTokenClaims: vi.fn(),
    loginWithRedirect: mockLoginWithRedirect,
    loginWithPopup: vi.fn(),
    logout: mockAuth0Logout,
    handleRedirectCallback: vi.fn(),
  };

  // Test specific overwrite takes precedence over defaultState
  const finalAuthState = {
    ...defaultAuthState,
    ...authStateOverrides,
  };

  vi.mocked(useAuth0).mockReturnValue(finalAuthState);
};

export const mockedUseNavigate = vi.fn();
export const mockedUseParams = vi.fn(() => ({})); // Default empty object
