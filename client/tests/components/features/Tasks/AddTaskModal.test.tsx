import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../../src/API/config';
import AddTaskModal from '../../../../src/components/features/Tasks/AddTaskModal/AddTaskModal';
import AllProviders from '../../../AllProviders';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';

describe('AddTaskModal', () => {
  const paramsId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <AddTaskModal />
      </MemoryRouter>,

      { wrapper: AllProviders }
    );

    const user = userEvent.setup();
    const addTaskButton = screen.getByRole('button', { name: /add new task/i });
    const titleInput = screen.getByRole('textbox', { name: /title/i });

    const fillAndSubmitForm = async () => {
      await user.type(titleInput, 'abc');
      await user.click(addTaskButton);
    };

    return {
      closeButton: screen.getByRole('button', { name: /close/i }),
      addTaskButton,
      titleInput,
      fillAndSubmitForm,
      user,
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
    mockedUseParams.mockReturnValue({ id: paramsId });
  });

  it('should render a modal with task form, proper button text and heading', () => {
    const { closeButton, addTaskButton, titleInput } = renderComponent();

    expect(closeButton).toBeInTheDocument();
    expect(addTaskButton).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /add new task/i })).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument(); // Check for a presence of one of input fields from the form
  });

  it('should redirect to /boards/:id on close', async () => {
    const { closeButton, user } = renderComponent();

    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
  });

  it('should display a success message if adding task was successful', async () => {
    server.use(http.post(`${apiUrl}/tasks`, () => HttpResponse.json({})));
    const { fillAndSubmitForm } = renderComponent();

    await fillAndSubmitForm();

    expect(screen.getByText(/successfully/i)).toBeInTheDocument();
  });

  it('should display a loading indicator when adding task is pending', async () => {
    server.use(
      http.post(`${apiUrl}/tasks`, async () => {
        await delay(1000);
        return HttpResponse.json({});
      })
    );
    const { fillAndSubmitForm } = renderComponent();

    await fillAndSubmitForm();

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should display an error if adding task failed', async () => {
    server.use(http.post(`${apiUrl}/tasks`, () => HttpResponse.error()));
    const { fillAndSubmitForm } = renderComponent();

    await fillAndSubmitForm();

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  // Test skipped because of issues with fake timers and user event library https://github.com/testing-library/user-event/issues/1115 - test always times out
  // Without fake timers the test passes if waitFor given timeout of 1600 (slightly above setTimeout from the component) but it makes the test slow
  it.skip('should navigate to /boards/:id after a 1.5 second delay on success', async () => {
    server.use(http.post(`${apiUrl}/tasks`, () => HttpResponse.json()));

    vi.useFakeTimers();
    const { fillAndSubmitForm } = renderComponent();

    await fillAndSubmitForm();

    await waitFor(
      async () => {
        expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
      },
      { timeout: 1600 }
    );

    vitest.useRealTimers();
  });
});
