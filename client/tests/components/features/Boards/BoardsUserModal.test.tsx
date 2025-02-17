import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom'; // Import Routes and Route
import { apiUrl } from '../../../../src/API/config';
import BoardUsersModal from '../../../../src/components/features/Boards/BoardUsersModal/BoardUsersModal';
import { BoardQuery, User, UserBoardData } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseNavigate, mockedUseParams } from '../../../utils';
import userEvent from '@testing-library/user-event';

describe('BoardUserModal', () => {
  const paramsId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';
  let board: BoardQuery;
  let users: User[];
  let userBoardData: UserBoardData;

  beforeAll(() => {
    users = [db.user.create(), db.user.create()];
    board = db.board.create({ id: paramsId, authorId: users[0].id }) as BoardQuery;

    userBoardData = {
      id: users[0].id,
      auth0Sub: '111',
      assignedTasks: [],
      boards: [{ board }],
      name: 'abc',
      email: 'abc',
      picture: '',
    };
  });

  afterAll(() => {
    db.board.delete({ where: { id: { equals: board.id } } });
    db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
  });

  beforeEach(() => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: users[0].id,
        auth0Sub: '111',
      },
    });
    mockedUseParams.mockReturnValue({ id: paramsId });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <BoardUsersModal />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
    };
  };

  it('should render a close button and a heading', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)), // Mock userBoardData
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)), // Mock board
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: users.map((user) => ({ user })) })
      ) // Mock users
    );

    renderComponent();

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /users/i }));
  });

  it('should render UsersList component with a list of users', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[0] }] })
      )
    );

    renderComponent();

    expect(await screen.findByText(users[0].email)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should not show add field and delete button if user is not the boards author', async () => {
    const regularUserBoardData = {
      id: users[1].id, // Id different than authorId in board
      auth0Sub: '111',
      assignedTasks: [],
      boards: [{ board }],
      name: 'abc',
      email: 'abc',
      picture: '',
    };
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(regularUserBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: users.map((user) => ({ user })) })
      )
    );

    renderComponent();

    expect(await screen.findByText(users[0].email)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should render loading indicator when fetching data', () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, async () => {
        await delay(1000);
        return HttpResponse.json(userBoardData);
      }),
      http.get(`${apiUrl}/boards/${paramsId}`, async () => {
        await delay(1000);
        return HttpResponse.json(board);
      }),
      http.get(`${apiUrl}/boards/${paramsId}/users`, async () => {
        await delay(1000);
        HttpResponse.json({ users: [] });
      })
    );
    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it.each([
    {
      scenario: 'an error when fetching userBoardData',
      responses: [
        http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.error()),
        http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
        http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
          HttpResponse.json({ users: [{ user: users[0] }] })
        ),
      ],
    },
    {
      scenario: 'an error when fetching board',
      responses: [
        http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
        http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.error()),
        http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
          HttpResponse.json({ users: [{ user: users[0] }] })
        ),
      ],
    },
    {
      scenario: 'an error when fetching board users',
      responses: [
        http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
        http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
        http.get(`${apiUrl}/boards/${paramsId}/users`, () => HttpResponse.error()),
      ],
    },
  ])('should render an error message for $scenario', async ({ responses }) => {
    server.use(...responses);
    renderComponent();

    expect(await screen.findByText(/error:/i)).toBeInTheDocument();
  });

  it('should navigate to /boards/:id when the modal is closed', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[0] }] })
      )
    );
    const { user } = renderComponent();
    await waitForElementToBeRemoved(() => screen.getByText(/loading.../i)); // Wait for the component to fully load

    const closeModalBtn = screen.getByRole('button', { name: /close modal/i });
    await user.click(closeModalBtn);

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
    });
  });

  it('should navigate to /boards/:id when clicking the modal backdrop', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[0] }] })
      )
    );

    const { user } = renderComponent();
    await waitForElementToBeRemoved(() => screen.getByText(/loading.../i)); // Wait for the component to fully load

    const modalBackdrop = screen.getByLabelText(/modal backdrop/i);
    await user.click(modalBackdrop);

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledWith(`/boards/${paramsId}`);
    });
  });

  it('should display a nested deletion modal when delete button is clicked', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[0] }] })
      )
    );
    const { user } = renderComponent();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });

    await user.click(deleteButton);

    expect(screen.getByRole('heading', { name: /remove/i })).toBeInTheDocument();
  });

  it('should close the nested deletion modal when cancel button is clicked', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[0] }] })
      )
    );
    const { user } = renderComponent();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /remove/i })).not.toBeInTheDocument();
    });
  });

  it('should close the nested deletion modal when close button is clicked', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[0] }] })
      )
    );
    const { user } = renderComponent();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    const closeButton = screen.getByRole('button', { name: /close/i, hidden: false }); // Close button from the original modal is hidden by the nested modal
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /remove/i })).not.toBeInTheDocument();
    });
  });

  it('should display a "processing" alert when deletion is pending', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.delete(`${apiUrl}/boards/${paramsId}/users/${users[1].id}`, async () => {
        await delay(1000);
        return HttpResponse.json([]);
      })
    );
    const { user } = renderComponent();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    const confirmDeleteButton = await screen.findByRole('button', { name: /confirm/i });

    await user.click(confirmDeleteButton);

    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  it('should display an error alert when user deletion is unsuccessful', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.delete(`${apiUrl}/boards/${paramsId}/users/${users[1].id}`, () => HttpResponse.error())
    );
    const { user } = renderComponent();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    const confirmDeleteButton = await screen.findByRole('button', { name: /confirm/i });

    await user.click(confirmDeleteButton);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('should refetch user data after successful deletion', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.delete(`${apiUrl}/boards/${paramsId}/users/${users[1].id}`, () => HttpResponse.json([]))
    );
    const { user } = renderComponent();
    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    await user.click(deleteButton);
    const confirmDeleteButton = await screen.findByRole('button', { name: /confirm/i });

    // Override the response for the refetch after deletion
    server.use(
      http.get(`${apiUrl}/boards/${paramsId}/users`, () => HttpResponse.json({ users: [] }))
    );
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText(users[1].email)).not.toBeInTheDocument();
    });
  });

  it('should display a "processing" alert when adding user is pending', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.post(`${apiUrl}/boards/${paramsId}/users/add`, async () => {
        await delay(1000);
        return HttpResponse.json();
      })
    );
    const { user } = renderComponent();
    const addButton = await screen.findByRole('button', { name: /add/i });
    const newUserInput = screen.getByRole('textbox');

    await user.type(newUserInput, 'abcdef@email.com');
    await user.click(addButton);

    expect(screen.getByText(/processing.../i)).toBeInTheDocument();
  });

  it('should display an error alert when adding user was unsuccessful', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.post(`${apiUrl}/boards/${paramsId}/users/add`, async () => HttpResponse.error())
    );
    const { user } = renderComponent();
    const addButton = await screen.findByRole('button', { name: /add/i });
    const newUserInput = screen.getByRole('textbox');

    await user.type(newUserInput, 'abcdef@email.com');
    await user.click(addButton);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should close alerts on close button click', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.post(`${apiUrl}/boards/${paramsId}/users/add`, async () => HttpResponse.error())
    );
    const { user } = renderComponent();
    const addButton = await screen.findByRole('button', { name: /add/i });
    const newUserInput = screen.getByRole('textbox');
    await user.type(newUserInput, 'abcdef@email.com');
    await user.click(addButton);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    const alert = await screen.findByRole('alert');
    const closeButton = await within(alert).findByRole('button', { name: /close/i });

    await user.click(closeButton);

    await waitFor(async () => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  // Test skipped because of issues with fake timers and user event library https://github.com/testing-library/user-event/issues/1115 - without fake timers it passes but with long timeout values, with fake timers enabled the test runs indefinitely
  it.skip(
    'should close the error alert after 5 seconds',
    async () => {
      server.use(
        http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
        http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
        http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
          HttpResponse.json({ users: [{ user: users[1] }] })
        ),
        http.post(`${apiUrl}/boards/${paramsId}/users/add`, async () => HttpResponse.error())
      );
      // vi.useFakeTimers();
      const { user } = renderComponent();
      const addButton = await screen.findByRole('button', { name: /add/i });
      const newUserInput = screen.getByRole('textbox');
      await user.type(newUserInput, 'abcdef@email.com');
      await user.click(addButton);
      expect(screen.getByText(/error/i)).toBeInTheDocument();

      // vi.advanceTimersByTime(5000);

      await waitFor(
        async () => {
          expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        },
        { timeout: 6000 }
      );

      // vi.useRealTimers();
    },
    { timeout: 6000 }
  );

  it('should refetch user data after successfully adding the user', async () => {
    const newUserEmail = 'abcdef@email.com';
    const newUser = db.user.create({ email: newUserEmail });
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)),
      http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }] })
      ),
      http.post(`${apiUrl}/boards/${paramsId}/users/add`, async () => HttpResponse.json({}))
    );
    const { user } = renderComponent();
    const addButton = await screen.findByRole('button', { name: /add/i });
    const newUserInput = screen.getByRole('textbox');

    server.use(
      http.get(`${apiUrl}/boards/${paramsId}/users`, () =>
        HttpResponse.json({ users: [{ user: users[1] }, { user: newUser }] })
      )
    );
    await user.type(newUserInput, newUserEmail);
    await user.click(addButton);

    expect(screen.getByText(newUserEmail)).toBeInTheDocument();
  });
});
