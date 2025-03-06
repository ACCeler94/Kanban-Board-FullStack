import { render, screen, waitFor } from '@testing-library/react';
import DeleteTaskModal from '../../../../src/components/features/Tasks/DeleteTaskModal/DeleteTaskModal';
import AllProviders from '../../../AllProviders';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { apiUrl } from '../../../../src/API/config';
import { delay, http, HttpResponse } from 'msw';

describe('DeleteTaskModal', () => {
  const boardId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';
  const taskId = '217f5f66-4b73-4ec3-92a0-b6d2d3aa52be';

  const renderComponent = () => {
    render(<DeleteTaskModal />, { wrapper: AllProviders });

    return {
      deleteButton: screen.getByRole('button', { name: /confirm/i }),
      cancelButton: screen.getByRole('button', { name: /cancel/i }),
      user: userEvent.setup(),
    };
  };

  beforeEach(() => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '',
        auth0Sub: '111',
      },
    });
    mockedUseParams.mockReturnValue({ id: boardId, taskId });
  });

  it('should render confirmation modal with proper text and confirm (delete) and cancel buttons', () => {
    const { cancelButton, deleteButton } = renderComponent();

    expect(cancelButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(screen.getByText(/delete this task/i)).toBeInTheDocument();
  });

  it('should navigate to `/boards/:id/tasks/:taskId when close btn is clicked`', async () => {
    const { user } = renderComponent();
    const closeButton = screen.getByRole('button', { name: /close/i });

    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}/tasks/${taskId}`);
  });

  it('should navigate to `/boards/:id/tasks/:taskId when cancel btn is clicked`', async () => {
    const { user, cancelButton } = renderComponent();

    await user.click(cancelButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}/tasks/${taskId}`);
  });

  it('should display a success message if deletion was successful', async () => {
    server.use(http.delete(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json({})));
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    expect(screen.getByText(/successfully/i)).toBeInTheDocument();
  });

  it('should display a loading indicator if deletion is pending', async () => {
    server.use(
      http.delete(`${apiUrl}/tasks/${taskId}`, async () => {
        await delay(1000);
        return HttpResponse.json({});
      })
    );
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should display an error if deletion fails', async () => {
    server.use(http.delete(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.error()));
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  // Test case skipped due to an issue with fake timers user event library https://github.com/testing-library/user-event/issues/1115, without them the test passes but takes too long.
  it.skip('should navigate to /boards/:id after a delay when deletion is successful', async () => {
    server.use(http.delete(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json()));
    // vi.useFakeTimers();
    const { user, deleteButton } = renderComponent();

    await user.click(deleteButton);

    await waitFor(
      () => {
        expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}/`);
      },
      { timeout: 1600 }
    );

    // vi.useRealTimers();
  });
});
