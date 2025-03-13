import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../../src/API/config';
import TaskModal from '../../../../src/components/features/Tasks/TaskModal/TaskModal';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';

describe('TaskModal', () => {
  const boardId = '1a3fca8a-cf40-40c8-adcf-6c5d6cc46c68';
  const taskId = '15dc7456-0f6d-458d-92aa-9b8d9d27a0db';
  const task = db.task.create();
  const subtask = db.subtask.create();
  const taskWithSubtask = { ...task, subtasks: [subtask] };

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <TaskModal />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
      waitForTheComponentToLoad: async () => {
        await waitForElementToBeRemoved(() => screen.getByText(/loading.../i));

        return {
          subtaskItem: screen.queryByRole('listitem'),
          getSaveChangesBtn: () => screen.queryByRole('button', { name: /save changes/i }), // It needs to be a function as it is not rendered initially
        };
      },
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

    mockedUseParams.mockReturnValue({
      id: boardId,
      taskId,
    });
  });

  it('should render a heading with task title, task menu button, close modal button and task description', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByRole('heading', { name: task.title })).toBeInTheDocument();
    expect(screen.getByLabelText(/menu button/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/close modal/i)).toBeInTheDocument();
    expect(screen.getByText(task.desc)).toBeInTheDocument();
  });

  it('should render a subtask list if task has subtasks', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskWithSubtask)));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByRole('heading', { name: /subtasks:/i })).toBeInTheDocument();
    expect(screen.getByText(taskWithSubtask.subtasks[0].desc)).toBeInTheDocument();
  });

  it('should not render subtasks section if task has no subtasks', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.queryByRole('heading', { name: /subtasks:/i })).not.toBeInTheDocument();
  });

  it('should render a loading indicator when fetching task data', () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, async () => {
        delay(1000);
        return HttpResponse.json(task);
      })
    );
    renderComponent();

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should render an error and a retry button if fetching task data fails', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.error()));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should navigate to /boards/:id when the modal closes', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { user, waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();
    const closeButton = screen.getByLabelText(/close modal/i);

    await user.click(closeButton);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}`);
  });

  it('should not show "Save changes" button if subtask status has not been modified', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskWithSubtask)));
    const { waitForTheComponentToLoad } = renderComponent();
    const { getSaveChangesBtn } = await waitForTheComponentToLoad();

    expect(getSaveChangesBtn()).not.toBeInTheDocument();
  });

  it('should show "Save changes" button if subtask status has been modified', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskWithSubtask)));
    const { user, waitForTheComponentToLoad } = renderComponent();
    const { subtaskItem, getSaveChangesBtn } = await waitForTheComponentToLoad();

    await user.click(subtaskItem!);

    expect(getSaveChangesBtn()).toBeInTheDocument();
  });

  it('should hide "Save changes" button again if subtask status returns to the initial value', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskWithSubtask)));
    const { user, waitForTheComponentToLoad } = renderComponent();
    const { subtaskItem, getSaveChangesBtn } = await waitForTheComponentToLoad();
    await user.click(subtaskItem!); // Click once to set as finished

    await user.click(subtaskItem!); // Click second time to set as unfinished again (back to initial value)

    expect(getSaveChangesBtn()).not.toBeInTheDocument();
  });

  it('should display a loading indicator if task edit (changing subtask status) is pending', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskWithSubtask)),
      http.patch(`${apiUrl}/tasks/${taskId}`, async () => {
        await delay(1000);
        return HttpResponse.json({});
      })
    );
    const { user, waitForTheComponentToLoad } = renderComponent();
    const { subtaskItem, getSaveChangesBtn } = await waitForTheComponentToLoad();
    await user.click(subtaskItem!); // Click once to set as finished

    await user.click(getSaveChangesBtn()!);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should update subtask status if the mutation is successful', async () => {
    const updatedSubtask = { ...subtask, finished: true };
    const updatedTask = {
      ...taskWithSubtask,
      subtasks: [updatedSubtask],
    };

    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskWithSubtask)),
      http.get(`${apiUrl}/boards/${boardId}`, () => HttpResponse.json({})),
      http.patch(`${apiUrl}/tasks/${taskId}`, async () => {
        await delay();
        return HttpResponse.json(updatedTask);
      })
    );

    const { user, waitForTheComponentToLoad } = renderComponent();
    const { subtaskItem, getSaveChangesBtn } = await waitForTheComponentToLoad();
    await user.click(subtaskItem!);

    await user.click(getSaveChangesBtn()!);

    await waitForElementToBeRemoved(() => screen.getByText(/loading.../i));

    expect(getSaveChangesBtn()).not.toBeInTheDocument();

    // Timing issue - no other way of accessing the checkbox gets the updated checkbox, even though the label is not changing properly in the testing environment
    await waitFor(() => {
      expect(within(subtaskItem!).getByRole('checkbox')).toBeChecked();
    });
  });
});
