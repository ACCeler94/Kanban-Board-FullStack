import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../../src/API/config';
import AddBoardModal from '../../../../src/components/features/Boards/AddBoardModal/AddBoardModal';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate } from '../../../utils';

describe('AddBoardModal', () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <AddBoardModal />
      </MemoryRouter>,

      { wrapper: AllProviders }
    );

    return {
      closeButton: screen.getByRole('button', { name: /close/i }),
      titleInput: screen.getByRole('textbox'),
      addBoardButton: screen.getByRole('button', { name: /add/i }),
      user: userEvent.setup({ delay: null }),
    };
  };
  it('should render a dialog with a proper heading, BoardForm and close button', () => {
    const { closeButton, addBoardButton, titleInput } = renderComponent();

    expect(screen.getByRole('heading', { name: /add new board/i })).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(addBoardButton).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
  });

  it('should close the modal and navigate to /boards on close button click', async () => {
    const { closeButton, user } = renderComponent();

    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith('/boards');
  });

  it('should display a loading indicator if when fetching response', async () => {
    mockAuthState({ isAuthenticated: true, isLoading: false, user: {} });
    server.use(
      http.post(`${apiUrl}/boards`, async () => {
        await delay();
        return HttpResponse.json({});
      })
    );
    const { addBoardButton, titleInput, user } = renderComponent();
    await user.type(titleInput, 'abc');

    await user.click(addBoardButton); // Submit the form to create a new board

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display an error message if the server responds with error', async () => {
    mockAuthState({ isAuthenticated: true, isLoading: false, user: {} });
    server.use(http.post(`${apiUrl}/boards`, async () => HttpResponse.error()));
    const { addBoardButton, titleInput, user } = renderComponent();
    await user.type(titleInput, 'abc');

    await user.click(addBoardButton);

    expect((await screen.findAllByText(/error/i)).length).toBeGreaterThan(0);
    expect(await screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('should display a success message if the board was successfully created', async () => {
    const board = db.board.create({ title: 'abc' });
    mockAuthState({ isAuthenticated: true, isLoading: false, user: {} });
    server.use(http.post(`${apiUrl}/boards`, async () => HttpResponse.json(board)));
    const { addBoardButton, titleInput, user } = renderComponent();
    await user.type(titleInput, 'abc');

    await user.click(addBoardButton);

    expect((await screen.findAllByText(/success/i)).length).toBeGreaterThan(0);
  });

  // Test skipped because of issues with fake timers and user event library https://github.com/testing-library/user-event/issues/1115 - test always times out
  // Without fake timers the test passes if waitFor given timeout of 1600 (slightly above setTimeout from the component) but it makes the test slow
  it.skip('should navigate to the newly created board on success', async () => {
    vi.useFakeTimers();
    const board = db.board.create({ title: 'abc' });
    mockAuthState({ isAuthenticated: true, isLoading: false, user: {} });
    server.use(http.post(`${apiUrl}/boards`, async () => HttpResponse.json(board)));
    const { addBoardButton, titleInput, user } = renderComponent();

    await user.type(titleInput, 'abc');
    await user.click(addBoardButton);
    vi.advanceTimersByTime(1600);

    await waitFor(
      async () => {
        expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${board.id}`);
      },
      { timeout: 1600 }
    );

    vitest.useRealTimers();
  });
});
