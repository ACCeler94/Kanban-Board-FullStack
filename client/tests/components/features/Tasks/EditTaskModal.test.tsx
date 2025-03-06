import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../../src/API/config';
import EditTaskModal from '../../../../src/components/features/Tasks/EditTaskModal/EditTaskModal';
import { TaskType } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';

describe('EditTaskModal', () => {
  const boardId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';
  const taskId = '542bfbaf-603a-471e-a716-8e4c6bdbee4e';
  let task: TaskType;

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <EditTaskModal />
      </MemoryRouter>,

      { wrapper: AllProviders }
    );
    const user = userEvent.setup();

    const waitForTheFormToLoad = async () => {
      await waitForElementToBeRemoved(screen.getByText(/loading.../i));

      const saveTaskButton = screen.getByRole('button', { name: /save/i });
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      const closeButton = screen.getByRole('button', { name: /close/i });

      const fillAndSubmitForm = async () => {
        await user.clear(titleInput);
        await user.type(titleInput, 'abc');
        await user.click(saveTaskButton);
      };

      return {
        saveTaskButton,
        titleInput,
        closeButton,
        fillAndSubmitForm,
      };
    };

    return {
      user,
      waitForTheFormToLoad,
    };
  };

  beforeAll(() => {
    task = db.task.create({ boardId });
  });

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

  afterAll(() => {
    db.task.delete({ where: { id: { equals: task.id } } });
  });

  it('should render a modal with task form, proper button text and heading', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheFormToLoad } = renderComponent();

    const { closeButton, saveTaskButton, titleInput } = await waitForTheFormToLoad();

    expect(closeButton).toBeInTheDocument();
    expect(saveTaskButton).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /edit/i })).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument(); // Check for a presence of one of input fields from the form
  });

  it('should populate input fields with fetched task data', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheFormToLoad } = renderComponent();
    await waitForTheFormToLoad();

    expect(screen.getByDisplayValue(task.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(task.desc)).toBeInTheDocument();
    expect(screen.getByDisplayValue(task.status)).toBeInTheDocument();
  });

  it('should redirect to /boards/:id on close', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { user, waitForTheFormToLoad } = renderComponent();
    const { closeButton } = await waitForTheFormToLoad();
    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}/tasks/${taskId}`);
  });

  it('should display a success message if editing task was successful', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    server.use(http.patch(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json({})));
    const { waitForTheFormToLoad } = renderComponent();
    const { fillAndSubmitForm } = await waitForTheFormToLoad();

    await fillAndSubmitForm();

    expect(screen.getByText(/successfully/i)).toBeInTheDocument();
  });

  it('should display a loading indicator when adding task is pending', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    server.use(
      http.patch(`${apiUrl}/tasks/${taskId}`, async () => {
        await delay();
        return HttpResponse.json({});
      })
    );
    const { waitForTheFormToLoad } = renderComponent();
    const { fillAndSubmitForm } = await waitForTheFormToLoad();

    await fillAndSubmitForm();

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should display an error if adding task failed', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    server.use(http.patch(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.error()));
    const { waitForTheFormToLoad } = renderComponent();
    const { fillAndSubmitForm } = await waitForTheFormToLoad();

    await fillAndSubmitForm();

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  // Test skipped because of issues with fake timers and user event library https://github.com/testing-library/user-event/issues/1115 - test always times out
  // Without fake timers the test passes if waitFor given timeout of 1600 (slightly above setTimeout from the component) but it makes the test slow
  it.skip('should navigate to /boards/:id/tasks/:taskId after a 1.5 second delay on success', async () => {
    // vi.useFakeTimers()

    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    server.use(http.patch(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json({})));
    const { waitForTheFormToLoad } = renderComponent();
    const { fillAndSubmitForm } = await waitForTheFormToLoad();

    await fillAndSubmitForm();
    // vi.advanceTimersByTime(1500)

    await waitFor(
      async () => {
        expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}/tasks/${taskId}`);
      },
      { timeout: 1600 }
    );
    // vitest.useRealTimers();
  });
});
