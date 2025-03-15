import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../src/API/config';
import MainLayout from '../../../src/components/layout/MainLayout/MainLayout';
import { BoardQuery, UserBoardData } from '../../../src/types/types';
import AllProviders from '../../AllProviders';
import { db } from '../../mocks/db';
import { server } from '../../mocks/server';
import { mockAuthState } from '../../utils';

// Mock the logo as it is imported as a react component by vite svgr plugin - if not mocked it throws an error
vi.mock('/src/assets/icon.svg?react', () => ({
  default: () => <div>Mocked Logo</div>,
}));

describe('MainLayout', () => {
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

    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: userId,
        auth0Sub: '111',
      },
    });

    server.use(
      http.get(`${apiUrl}/boards/${board.id}`, () => HttpResponse.json(board)),
      http.get(`${apiUrl}/users/profile/boards`, () => HttpResponse.json(userBoardData))
    );
  });
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    const waitForTheComponentToLoad = async () => {
      await waitForElementToBeRemoved(() => screen.getByText(/loading.../i));

      return {
        hideSidebarButton: screen.getByLabelText(/hide sidebar/i),
      };
    };

    return {
      waitForTheComponentToLoad,
      user: userEvent.setup(),
    };
  };

  it('should render Navbar and Sidebar components', async () => {
    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByRole('heading', { name: /all boards/i })).toBeInTheDocument(); // A part of Sidebar component
    expect(screen.getByText('Mocked Logo')).toBeInTheDocument(); // Logo is a part of Navbar component
  });

  it('should render show sidebar button if hide sidebar button is clicked', async () => {
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { hideSidebarButton } = await waitForTheComponentToLoad();

    await user.click(hideSidebarButton);

    expect(screen.getByLabelText(/show sidebar/i)).toBeInTheDocument();
  });

  it('should not display show sidebar button again if it is pressed', async () => {
    const { waitForTheComponentToLoad, user } = renderComponent();
    const { hideSidebarButton } = await waitForTheComponentToLoad();

    await user.click(hideSidebarButton);
    const showButton = screen.getByLabelText(/show sidebar/i);
    await user.click(showButton);

    expect(showButton).not.toBeInTheDocument();
  });
});
