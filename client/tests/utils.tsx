import { useAuth0, User } from '@auth0/auth0-react';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | undefined;
};

export const mockAuth0Logout = vi.fn();
export const mockLoginWithRedirect = vi.fn();

export const mockAuthState = (authState: AuthState) => {
  vi.mocked(useAuth0).mockReturnValue({
    ...authState,
    getAccessTokenSilently: vi.fn().mockResolvedValue('test-token'),
    getAccessTokenWithPopup: vi.fn(),
    getIdTokenClaims: vi.fn(),
    loginWithRedirect: mockLoginWithRedirect,
    loginWithPopup: vi.fn(),
    logout: mockAuth0Logout,
    handleRedirectCallback: vi.fn(),
  });
};

export const mockedUseNavigate = vi.fn();
export const mockedUseParams = vi.fn(() => ({})); // Default empty object
