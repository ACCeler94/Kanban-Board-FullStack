import { render, screen, waitFor } from '@testing-library/react';
import PostLoginPage from '../../src/pages/PostLoginPage/PostLoginPage';
import { MemoryRouter } from 'react-router-dom';
import AllProviders from '../AllProviders';
import { mockAuthState, mockedUseNavigate } from '../utils';
import axios from 'axios';
import { authUrl } from '../../src/API/config';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

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

  beforeEach(() => vi.resetAllMocks());

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
    vi.mocked(axios, true).get.mockResolvedValueOnce({});
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: {},
    });
    server.use(http.post(`${authUrl}/post-login`, () => HttpResponse.json({}))); // Simulate success
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
});
