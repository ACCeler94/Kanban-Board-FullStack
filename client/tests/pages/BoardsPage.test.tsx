import { MemoryRouter } from 'react-router-dom';
import BoardsPage from '../../src/pages/BoardsPage/BoardsPage';
import AllProviders from '../AllProviders';
import { mockAuthState, mockLoginWithRedirect } from '../utils';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { apiUrl } from '../../src/API/config';
import { BoardQuery, UserBoardData } from '../../src/types/types';
import { db } from '../mocks/db';

// Mock the logo as it is imported as a react component by vite svgr plugin - if not mocked it throws an error
vi.mock('/src/assets/icon.svg?react', () => ({
  default: () => <div>Mocked Logo</div>,
}));
describe('BoardsPage', () => {
  const userId = 'f4ad5b3e-04a1-499d-8846-40a023b4e802';
  let board: BoardQuery;
  let userBoardData: UserBoardData;

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

    server.use(
      http.get(`${apiUrl}/boards/${board.id}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData))
    );
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <BoardsPage />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );
  };

  it('should render MainLayout component if isAuthenticated is true', () => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {},
    });
    renderComponent();

    waitFor(() => {
      expect(screen.getByText('Mocked Logo')).toBeInTheDocument();
    });
  });

  it('should show a loading indicator if the authentication information is loading', () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: true,
      user: {},
    });
    renderComponent();

    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  it('should call loginWithRedirect if the user is neither authenticated nor loading the auth data', () => {
    mockAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: {},
    });
    renderComponent();

    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });
});
