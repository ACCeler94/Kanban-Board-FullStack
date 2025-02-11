import { render, screen, waitFor } from '@testing-library/react';
import BoardsList from '../../../../src/components/features/Boards/BoardsList/BoardsList';
import AllProviders from '../../../AllProviders';
import { MemoryRouter } from 'react-router-dom';
import { BoardPreview } from '../../../../src/types/types';
import { mockedUseParams } from '../../../utils';
import styles from '../../../../src/components/features/Boards/BoardsList/BoardsList.module.css';
import useStore from '../../../../src/store/useStore';
import userEvent from '@testing-library/user-event';

describe('BoardsList', () => {
  const boards: BoardPreview[] = [
    { board: { title: 'abc', id: '1' } },
    { board: { title: 'cde', id: '2' } },
  ];
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <BoardsList boards={boards} />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      createNewBoardLink: screen.getByRole('link', { name: /create/i }),
      heading: screen.getByRole('heading', { name: /all boards/i }),
      user: userEvent.setup(),
    };
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render a heading and create new board link', () => {
    const { createNewBoardLink, heading } = renderComponent();

    expect(heading).toBeInTheDocument();
    expect(createNewBoardLink).toBeInTheDocument();
    expect(createNewBoardLink).toHaveAttribute('href', '/add');
  });

  it('should render a list of boards as links with proper href attribute', () => {
    renderComponent();

    boards.forEach((b) => {
      const link = screen.getByRole('link', { name: b.board.title });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/${b.board.id}`);
    });
  });

  it('should give an active class to the board with matching id to the id from params', () => {
    useStore.setState({ activeBoard: { id: boards[0].board.id, title: boards[0].board.title } });
    mockedUseParams.mockReturnValue({ id: boards[0].board.id });
    renderComponent();

    expect(screen.getByRole('link', { name: boards[0].board.title })).toHaveClass(styles.active);
    expect(screen.getByRole('link', { name: boards[1].board.title })).not.toHaveClass(
      styles.active
    );
  });

  it('should not give an active class to any of the links if there is no id in params', () => {
    renderComponent();

    boards.forEach((b) => {
      expect(screen.getByRole('link', { name: b.board.title })).not.toHaveClass(styles.active);
    });
  });

  it('should not give an active class to any of the links if id from params is invalid', () => {
    mockedUseParams.mockReturnValue({ id: 'abc' });
    renderComponent();

    boards.forEach((b) => {
      expect(screen.getByRole('link', { name: b.board.title })).not.toHaveClass(styles.active);
    });
  });

  it('should call setActiveBoard when params are valid board id on mount', () => {
    mockedUseParams.mockReturnValue({ id: boards[0].board.id });
    const mockSetActiveBoard = vi.fn();
    useStore.setState({ setActiveBoard: mockSetActiveBoard });
    renderComponent();

    expect(mockSetActiveBoard).toHaveBeenCalledWith({
      id: boards[0].board.id,
      title: boards[0].board.title,
    });
  });

  it('should call setActiveBoard when a board link is clicked', async () => {
    const mockSetActiveBoard = vi.fn();
    useStore.setState({ setActiveBoard: mockSetActiveBoard });
    const { user } = renderComponent();
    const boardToClick = screen.getByRole('link', { name: boards[1].board.title });

    await user.click(boardToClick);

    expect(mockSetActiveBoard).toHaveBeenCalledWith({
      id: boards[1].board.id,
      title: boards[1].board.title,
    });
  });

  it('should give the clicked board an active class', async () => {
    const mockSetActiveBoard = vi.fn();
    useStore.setState({ setActiveBoard: mockSetActiveBoard });
    const { user } = renderComponent();
    const boardToClick = screen.getByRole('link', { name: boards[1].board.title });
    await user.click(boardToClick);

    // Simulate change of params after clicking a Link element
    mockedUseParams.mockReturnValue({ id: boards[1].board.id });
    // Wait for Zustand state update
    await waitFor(() => {
      useStore.setState({
        activeBoard: {
          id: boards[1].board.id,
          title: boards[1].board.title,
        },
      });
    });

    expect(screen.getByRole('link', { name: boards[1].board.title })).toHaveClass(styles.active);
  });
});
