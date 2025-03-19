import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { authUrl } from '../../src/API/config';
import PostLoginPage from '../../src/pages/PostLoginPage/PostLoginPage';
import AllProviders from '../AllProviders';
import { mockAuthState, mockedUseNavigate } from '../utils';

vi.mock('axios');

describe('PostLoginPage', () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <PostLoginPage />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should display "Processing login..." message when fetching authentication status', () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: true,
      user: {},
    });
    renderComponent();

    expect(screen.getByText('Processing login...')).toBeInTheDocument();
  });

  it('should make a request to post-login endpoint and redirect to /boards on success', async () => {
    vi.mocked(axios, true).post.mockResolvedValueOnce({}); // Simulate success
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: {},
    });
    renderComponent();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${authUrl}/post-login`,
        {},
        {
          headers: {
            authorization: `Bearer test-token`,
          },
          withCredentials: true,
        }
      );

      expect(mockedUseNavigate).toHaveBeenCalledWith('/boards');
    });
  });
  it('should make redirect to /login-error when an error occurs', async () => {
    vi.mocked(axios, true).post.mockRejectedValueOnce(new Error()); // Simulate error
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: {},
    });
    renderComponent();

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith('/login-error');
    });
  });
});
