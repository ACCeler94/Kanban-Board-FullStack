import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom'; // Import Routes and Route
import { apiUrl } from '../../../../src/API/config';
import DeleteBoardModal from '../../../../src/components/features/Boards/DeleteBoardModal/DeleteBoardModal';
import AllProviders from '../../../AllProviders';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';

describe('DeleteBoardModal', () => {
  const paramsId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';

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
        <DeleteBoardModal />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
      deleteButton: screen.getByRole('button', { name: /confirm/i }),
      closeButton: screen.getByRole('button', { name: /close/i }),
      cancelButton: screen.getByRole('button', { name: /cancel/i }),
    };
  };

  it('should render delete message, confirm delete, close and cancel buttons', () => {
    const { deleteButton, closeButton, cancelButton } = renderComponent();

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('should render loading indicator when deletion is pending', async () => {
    server.use(
      http.delete(`${apiUrl}/boards/${paramsId}`, async () => {
        await delay();
        return HttpResponse.json();
      })
    );
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should render error if deletion is unsuccessful', async () => {
    server.use(http.delete(`${apiUrl}/boards/${paramsId}`, async () => HttpResponse.error()));
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  it('should render a success message when deletion is successful', async () => {
    server.use(http.delete(`${apiUrl}/boards/${paramsId}`, async () => HttpResponse.json({})));
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    expect(screen.getByText(/board removed/i)).toBeInTheDocument();
  });

  // Test skipped because of issues with fake timers and user event library https://github.com/testing-library/user-event/issues/1115 - without fake timers it passes but with long timeout values, with fake timers enabled the test runs indefinitely
  it.skip('should redirect to /boards after a delay if board deletion is successful', async () => {
    server.use(http.delete(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json()));
    // vi.useFakeTimers();
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);
    // vi.advanceTimersByTime(2000);

    await waitFor(
      () => {
        expect(mockedUseNavigate).toHaveBeenCalledWith('/boards');
      },
      { timeout: 1600 }
    );

    // vi.useRealTimers();
  });

  it('should redirect to /boards/:id when close btn is clicked', async () => {
    const { closeButton, user } = renderComponent();

    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
  });

  it('should redirect to /boards/:id when cancel btn is clicked', async () => {
    const { cancelButton, user } = renderComponent();

    await user.click(cancelButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
  });

  it('should redirect to /boards/:id when backdrop is clicked', async () => {
    const { user } = renderComponent();
    const backdrop = screen.getByLabelText('Modal Backdrop');

    await user.click(backdrop);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
  });
});
