import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../src/API/config';
import Navbar from '../../../src/components/layout/Navbar/Navbar';
import useStore from '../../../src/store/useStore';
import { BoardQuery, UserBoardData } from '../../../src/types/types';
import AllProviders from '../../AllProviders';
import { db } from '../../mocks/db';
import { server } from '../../mocks/server';
import { mockAuthState, mockedUseParams } from '../../utils';

// Mock the logo as it is imported as a react component by vite svgr plugin - if not mocked it throws an error
vi.mock('/src/assets/icon.svg?react', () => ({
  default: () => <div>Mocked Logo</div>,
}));

describe('Navbar', () => {
  const userId = 'f4ad5b3e-04a1-499d-8846-40a023b4e802';
  let board: BoardQuery;
  let userBoardData: UserBoardData;

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
      addTaskButton: screen.getByLabelText(/add new task/i),
      getMenuButton: () => screen.getByRole('button', { name: /menu/i }),
    };
  };

  beforeAll(() => {
    board = db.board.create({ authorId: userId }) as BoardQuery;

    userBoardData = {
      id: userId,
      auth0Sub: '111',
      assignedTasks: [],
      boards: [{ board }],
      name: 'abc',
      email: 'abc',
      picture: '',
    };
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: userId,
        auth0Sub: '111',
      },
    });

    mockedUseParams.mockReturnValue({ id: board.id });
  });

  it('should render a heading with "kanban" text and logo', () => {
    useStore.setState({ activeBoard: null });
    server.use(
      http.get(`${apiUrl}/boards/${board.id}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData))
    );
    renderComponent();

    expect(screen.getByRole('heading', { name: 'kanban' })).toBeInTheDocument();
    expect(screen.getByText('Mocked Logo')).toBeInTheDocument(); // This text is a replacement for a real icon during testing
  });

  it('should render a disabled add new task button and "Select a board..." prompt if no board is set as active', () => {
    mockedUseParams.mockReturnValue({}); // Simulate no board selected - no id in the url
    useStore.setState({ activeBoard: null });
    server.use(http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)));

    const { addTaskButton } = renderComponent();

    expect(screen.getByText('Select a board...')).toBeInTheDocument();
    expect(addTaskButton).toBeInTheDocument();
    expect(addTaskButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render board title, menu button and enable add task button if board is selected', () => {
    useStore.setState({ activeBoard: board });
    server.use(
      http.get(`${apiUrl}/boards/${board.id}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData))
    );
    const { addTaskButton, getMenuButton } = renderComponent();

    expect(screen.getByText(board.title)).toBeInTheDocument();
    expect(screen.queryByText('Select a board...')).not.toBeInTheDocument();
    expect(addTaskButton).not.toHaveAttribute('aria-disabled', 'true');
    expect(addTaskButton).toHaveAttribute('href', `/${board.id}/tasks/add`);
    expect(getMenuButton()).toBeInTheDocument();
  });

  it("should show full board menu if authenticated user is the board's author", async () => {
    useStore.setState({ activeBoard: board });
    server.use(
      http.get(`${apiUrl}/boards/${board.id}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData))
    );
    const { user, getMenuButton } = renderComponent();

    await user.click(getMenuButton());

    expect(screen.getByText(/users/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it('should only show "Users" in the menu button if authenticated user is not the author', async () => {
    const notAuthorUserId = '22d7c279-44a8-4c39-98ab-bdf2cd20cd3e';
    const anotherUserBoardData = {
      id: notAuthorUserId,
      auth0Sub: '111',
      assignedTasks: [],
      boards: [{ board }],
      name: 'abc',
      email: 'abc',
      picture: '',
    };
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: notAuthorUserId,
        auth0Sub: '111',
      },
    });
    useStore.setState({ activeBoard: board });
    server.use(
      http.get(`${apiUrl}/boards/${board.id}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(anotherUserBoardData))
    );
    const { user, getMenuButton } = renderComponent();

    await user.click(getMenuButton());

    expect(screen.getByText(/users/i)).toBeInTheDocument();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
  });
});
