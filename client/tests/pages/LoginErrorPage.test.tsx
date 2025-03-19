import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { authUrl } from '../../src/API/config';
import LoginErrorPage from '../../src/pages/LoginErrorPage/LoginErrorPage';
import AllProviders from '../AllProviders';
import { server } from '../mocks/server';
import { mockAuth0Logout, mockAuthState, mockedUseNavigate, mockLoginWithRedirect } from '../utils';

vi.mock('axios');

describe('LoginErrorPage', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();

    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: {},
    });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <LoginErrorPage />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
      retryButton: screen.getByRole('button', { name: /retry/i }),
      homepageButton: screen.getByRole('button', { name: /homepage/i }),
    };
  };

  it('should render a message, homepage and retry buttons', () => {
    const { retryButton, homepageButton } = renderComponent();

    expect(screen.getByText(/try again/i)).toBeInTheDocument();
    expect(homepageButton).toBeInTheDocument();
    expect(retryButton).toBeInTheDocument();
  });

  it('should call loginWithRedirect if retry button was clicked', async () => {
    const { user, retryButton } = renderComponent();

    await user.click(retryButton);

    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      authorizationParams: {
        redirect_uri: import.meta.env.VITE_ROOT_URL + '/post-login',
      },
    });
  });

  it('should call logout, make a logout request when homepage button is pressed and isAuthenticated is true', async () => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {},
    });
    vi.mocked(axios, true).get.mockResolvedValueOnce({});
    server.use(http.get(`${authUrl}/logout`, () => HttpResponse.json({})));
    const { user, homepageButton } = renderComponent();

    await user.click(homepageButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(`${authUrl}/logout`, {
        headers: {
          authorization: 'Bearer test-token',
        },
        withCredentials: process.env.NODE_ENV === 'production',
      });
      expect(mockAuth0Logout).toHaveBeenCalled();
    });
  });

  it('should call logout, make a logout request and redirect to "/" when homepage button is pressed', async () => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {},
    });
    vi.mocked(axios, true).get.mockResolvedValueOnce({});
    server.use(http.get(`${authUrl}/logout`, () => HttpResponse.json({})));
    const { user, homepageButton } = renderComponent();

    await user.click(homepageButton);

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should log the error and redirect to "/" if request fails', async () => {
    const error = new Error();
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {},
    });
    vi.mocked(axios, true).get.mockRejectedValueOnce(error);
    server.use(http.get(`${authUrl}/logout`, () => HttpResponse.json({})));
    const { user, homepageButton } = renderComponent();

    await user.click(homepageButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(mockedUseNavigate).toHaveBeenCalledWith('/');
    });
  });
});
