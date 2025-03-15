import { User } from '@auth0/auth0-react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl, authUrl } from '../../../src/API/config';
import SideBar from '../../../src/components/layout/SideBar/SideBar';
import { BoardQuery, UserBoardData } from '../../../src/types/types';
import AllProviders from '../../AllProviders';
import { db } from '../../mocks/db';
import { server } from '../../mocks/server';
import { mockAuth0Logout, mockAuthState } from '../../utils';

describe('SideBar', () => {
  const toggleIsHidden = vi.fn();

  let board: BoardQuery;
  let user: User;
  let userBoardData: UserBoardData;

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <SideBar isHidden={false} toggleIsHidden={toggleIsHidden} />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    const waitForTheComponentToLoad = async () => {
      await waitForElementToBeRemoved(screen.getByText(/loading.../i));

      return {
        hideButton: screen.getByRole('button', { name: /hide/i }),
        logoutButton: screen.getByRole('button', { name: /logout/i }),
      };
    };

    return {
      waitForTheComponentToLoad,
      user: userEvent.setup(),
    };
  };

  beforeAll(() => {
    user = db.user.create();
    board = db.board.create({ authorId: user.id }) as BoardQuery;

    userBoardData = {
      id: user.id,
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
        id: user.id,
        auth0Sub: '111',
      },
    });
  });

  it('should render a  heading, list of boards, hide sidebar button and a logout button ', async () => {
    server.use(http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)));
    const { waitForTheComponentToLoad } = renderComponent();
    const { hideButton, logoutButton } = await waitForTheComponentToLoad();

    expect(screen.getByRole('heading', { name: 'All Boards (1)' }));
    expect(screen.getByText(board.title)).toBeInTheDocument();
    expect(hideButton).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
  });

  it('should change the "All Boards" heading based on the number of boards', async () => {
    const board1 = db.board.create({ authorId: user.id }) as BoardQuery;
    const board2 = db.board.create({ authorId: user.id }) as BoardQuery;

    const changedUserBoardData = {
      id: user.id,
      auth0Sub: '111',
      assignedTasks: [],
      boards: [{ board: board1 }, { board: board2 }],
      name: 'abc',
      email: 'abc',
      picture: '',
    };
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(changedUserBoardData))
    );
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(
      screen.getByRole('heading', { name: `All Boards (${changedUserBoardData.boards.length})` })
    );
  });

  it('should show a loading indicator if user data is pending', async () => {
    server.use(
      http.get(`${apiUrl}/users/profile/boards`, async () => {
        await delay(1000);
        return HttpResponse.json(userBoardData);
      })
    );
    renderComponent();

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('should show an error if fetching user data fails', async () => {
    server.use(http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.error()));
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should call toggleIsHidden with value true if hide sidebar button is clicked', async () => {
    server.use(http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { hideButton } = await waitForTheComponentToLoad();

    await user.click(hideButton);

    expect(toggleIsHidden).toHaveBeenCalled();
  });

  it('should call logout and redirect on success when logout button has been clicked', async () => {
    server.use(http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { logoutButton } = await waitForTheComponentToLoad();

    server.use(http.get(`${authUrl}/logout`, () => HttpResponse.json({})));
    await user.click(logoutButton);

    expect(mockAuth0Logout).toHaveBeenCalled();
  });

  it('should show an error if logout failed', async () => {
    server.use(http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData)));
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { logoutButton } = await waitForTheComponentToLoad();

    server.use(http.get(`${authUrl}/logout`, () => HttpResponse.error()));
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});
