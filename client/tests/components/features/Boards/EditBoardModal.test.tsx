import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom'; // Import Routes and Route
import { apiUrl } from '../../../../src/API/config';
import EditBoardModal from '../../../../src/components/features/Boards/EditBoardModal/EditBoardModal';
import AllProviders from '../../../AllProviders';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';
import { db } from '../../../mocks/db';
import { BoardQuery } from '../../../../src/types/types';

describe('EditBoardModal', () => {
  const paramsId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';
  let board: BoardQuery;
  beforeAll(() => (board = db.board.create({ id: paramsId, authorId: '123' }) as BoardQuery));

  beforeEach(() => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '',
        auth0Sub: '111',
      },
    });
    mockedUseParams.mockReturnValue({ id: paramsId });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <EditBoardModal />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      waitForTheComponentToLoad: async () => {
        await waitForElementToBeRemoved(screen.getByText(/loading.../i));

        return {
          closeButton: screen.getByRole('button', { name: /close/i }),
          saveChangesButton: screen.getByRole('button', { name: /save/i }),
          titleInput: screen.getByRole('textbox'),
        };
      },
      user: userEvent.setup(),
    };
  };

  it('should render heading, input with board title, save changes button and close modal button ', async () => {
    server.use(http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)));
    const { waitForTheComponentToLoad } = renderComponent();
    const { titleInput, closeButton, saveChangesButton } = await waitForTheComponentToLoad();

    expect(screen.getByRole('heading', { name: /edit/i })).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(saveChangesButton).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveValue(board.title);
  });

  it('should render loading indicator when edit is pending', async () => {
    server.use(
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.patch(`${apiUrl}/boards/${paramsId}`, async () => {
        await delay();
        return HttpResponse.json();
      })
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { titleInput, saveChangesButton } = await waitForTheComponentToLoad();

    await user.clear(titleInput);
    await user.type(titleInput, 'abc');
    await user.click(saveChangesButton);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should render error if editing fails', async () => {
    server.use(
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.patch(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.error())
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { titleInput, saveChangesButton } = await waitForTheComponentToLoad();

    await user.clear(titleInput);
    await user.type(titleInput, 'abc');
    await user.click(saveChangesButton);

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  it('should render a success message if board has been successfully edited', async () => {
    server.use(
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.patch(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json({}))
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { titleInput, saveChangesButton } = await waitForTheComponentToLoad();

    await user.clear(titleInput);
    await user.type(titleInput, 'abc');
    await user.click(saveChangesButton);

    expect(screen.getByText(/successfully/i)).toBeInTheDocument();
  });

  it('should navigate to /boards/:id when the modal is closed', async () => {
    server.use(http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { closeButton } = await waitForTheComponentToLoad();

    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
  });

  // Test skipped because of issues with fake timers and user event library https://github.com/testing-library/user-event/issues/1115 - without fake timers it passes but needs the timeout to pass making the test slow. With fake timers it runs indefinitely
  it.skip('should navigate to /boards/:id after 1.5 second delay on success', async () => {
    server.use(
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.patch(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json({}))
    );
    // vi.useFakeTimers()
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { titleInput, saveChangesButton } = await waitForTheComponentToLoad();

    await user.clear(titleInput);
    await user.type(titleInput, 'abc');
    await user.click(saveChangesButton);
    // vi.advanceTimersByTime(1600)

    await waitFor(() => expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`));

    vi.useRealTimers();
  });
});
