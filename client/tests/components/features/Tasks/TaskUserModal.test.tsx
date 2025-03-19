import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../../src/API/config';
import TaskUsersModal from '../../../../src/components/features/Tasks/TaskUsersModal/TaskUsersModal';
import { TaskType, User } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';

describe('TaskUserModal', () => {
  const boardId = '0e6e9c2c-c7f0-4e03-a101-2c09a7031f08';
  const taskId = '399030d8-bf8b-41e2-baa4-16c63e38bcc3';
  let task: TaskType;
  const users: User[] = [];
  let newUser: User;

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <TaskUsersModal />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    const waitForTheComponentToLoad = async () => {
      await waitForElementToBeRemoved(() => screen.getByText(/loading.../i));

      return {
        emailInput: screen.queryByRole('textbox'),
        addBtn: screen.queryByRole('button', { name: /add/i }),
      };
    };

    return {
      user: userEvent.setup(),
      waitForTheComponentToLoad,
    };
  };

  beforeAll(() => {
    task = db.task.create();
    [1, 2].forEach(() => {
      const user = db.user.create();
      users.push(user);
    });

    const structuredUsersArr = users.map((u) => {
      return { user: { ...u } };
    });

    task.assignedUsers = structuredUsersArr;

    newUser = db.user.create({ email: 'abc@gmail.com' });
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

  it('should render a "Users" heading, close modal btn and a list of users', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    expect(screen.getByText(users[0].name)).toBeInTheDocument();
    expect(screen.getByText(users[1].name)).toBeInTheDocument();
  });

  it('should show a loading indicator when task data is pending', () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, async () => {
        await delay(1000);
        return HttpResponse.json(task);
      })
    );
    renderComponent();

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should show an error if fetching task data fails', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.error()));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  it('should navigate to /boards/:id/tasks/:taskId when modal closes', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const closeBtn = screen.getByRole('button', { name: /close modal/i });

    await user.click(closeBtn);

    expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${boardId}/tasks/${taskId}`);
  });

  it('should add a user to the list if adding user is successful', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.post(`${apiUrl}/tasks/${taskId}/users/add`, () => HttpResponse.json(newUser))
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { emailInput, addBtn } = await waitForTheComponentToLoad();

    await user.type(emailInput!, newUser.email);
    await user.click(addBtn!);

    await waitFor(() => expect(screen.getByText(newUser.name)).toBeInTheDocument());
  });

  it('should display "Processing..." message if addition is pending', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.post(`${apiUrl}/tasks/${taskId}/users/add`, async () => {
        await delay(1000);
        return HttpResponse.json(newUser);
      })
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { emailInput, addBtn } = await waitForTheComponentToLoad();

    await user.type(emailInput!, newUser.email);
    await user.click(addBtn!);

    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  it('should display an error alert if adding user failed', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.post(`${apiUrl}/tasks/${taskId}/users/add`, () => HttpResponse.error())
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { emailInput, addBtn } = await waitForTheComponentToLoad();

    await user.type(emailInput!, newUser.email);
    await user.click(addBtn!);
    const alert = await screen.findByRole('alert');

    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/error/i);
  });

  it('should close the add error alert when close button is clicked', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.post(`${apiUrl}/tasks/${taskId}/users/add`, () => HttpResponse.error())
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { emailInput, addBtn } = await waitForTheComponentToLoad();

    await user.type(emailInput!, newUser.email);
    await user.click(addBtn!);

    const alert = await screen.findByRole('alert');
    const closeButton = await within(alert).findByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('should display a confirmation modal when delete button is clicked', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });

    await user.click(deleteBtns[0]);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('should close nested modal if close button is clicked', async () => {
    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });

    await user.click(deleteBtns[0]);
    const closeNestedBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(closeNestedBtn);

    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
    });
  });

  it('should refetch task data after successful deletion', async () => {
    const taskAfterDelete = { ...task, assignedUsers: [{ user: users[1] }] };
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.delete(`${apiUrl}/tasks/${taskId}/users/${users[0].id}`, async () =>
        HttpResponse.json({})
      )
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteBtns[0]);

    server.use(http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(taskAfterDelete)));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(screen.queryByText(users[0].name)).not.toBeInTheDocument();
  });

  it('should display "Processing" message if deletion is pending', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.delete(`${apiUrl}/tasks/${taskId}/users/${users[0].id}`, async () => {
        await delay(1000);
        return HttpResponse.json({});
      }),
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task))
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });

    await user.click(deleteBtns[0]);
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  it('should display an error if user deletion fails', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.delete(`${apiUrl}/tasks/${taskId}/users/${users[0].id}`, () => HttpResponse.error())
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });

    await user.click(deleteBtns[0]);
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    const alert = await screen.findByRole('alert');

    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/error/i);
  });

  it('should close the delete error alert when close button is clicked', async () => {
    server.use(
      http.get(`${apiUrl}/tasks/${taskId}`, () => HttpResponse.json(task)),
      http.delete(`${apiUrl}/tasks/${taskId}/users/${users[0].id}`, () => HttpResponse.error())
    );
    const { waitForTheComponentToLoad, user } = renderComponent();
    await waitForTheComponentToLoad();
    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteBtns[0]);
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    const alert = await screen.findByRole('alert');
    const closeButton = await within(alert).findByRole('button', { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
