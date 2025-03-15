import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { apiUrl } from '../../../../src/API/config';
import Board from '../../../../src/components/features/Boards/Board/Board';
import { BoardQuery, TaskStatus, TaskTypePartial } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { server } from '../../../mocks/server';
import { mockAuthState, mockedUseParams } from '../../../utils';

// DND functionality not tested due to issues with testing it's behavior in dom environment
describe('Board', () => {
  const paramsId = '373d5aa1-4084-4328-8435-e3b1771c0dc2';
  let board: BoardQuery;
  const tasks: TaskTypePartial[] = [];
  const toDoTaskTitle = 'To-Do task 1';
  const inProgressTaskTitle = 'In-progress task 1';
  const doneTaskTitle = 'Finished task 1';
  let task1, task2, task3;

  beforeAll(() => {
    // Create tasks
    task1 = db.task.create({
      status: TaskStatus.TO_DO,
      boardId: paramsId,
      title: toDoTaskTitle,
    });
    task2 = db.task.create({
      status: TaskStatus.IN_PROGRESS,
      boardId: paramsId,
      title: inProgressTaskTitle,
    });
    task3 = db.task.create({
      status: TaskStatus.DONE,
      boardId: paramsId,
      title: doneTaskTitle,
    });
    tasks.push(task1, task2, task3);

    // Create board with previously created tasks
    board = db.board.create({
      id: paramsId,
      tasks: [task1, task2, task3],
    }) as BoardQuery;
  });

  beforeEach(() => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '111',
        auth0Sub: '111',
      },
    });
    mockedUseParams.mockReturnValue({ id: paramsId });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Board />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
      waitForTheComponentToLoad: async () => {
        await waitForElementToBeRemoved(() => screen.getAllByLabelText(/loading/i));
      },
    };
  };

  it('should render a loading skeleton when fetching board data', () => {
    server.use(
      http.get(`${apiUrl}/boards/${paramsId}`, async () => {
        await delay();
        return HttpResponse.json({});
      })
    );
    renderComponent();

    expect(screen.getAllByLabelText(/loading/i).length).toBeGreaterThan(0);
  });

  it('should render To Do, In Progress and Done columns', async () => {
    server.use(http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)));
    const { waitForTheComponentToLoad } = renderComponent();

    await waitForTheComponentToLoad();

    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('should arrange tasks to the proper column by task status', async () => {
    server.use(http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.json(board)));
    const { waitForTheComponentToLoad } = renderComponent();

    await waitForTheComponentToLoad();
    const columns = screen.getAllByRole('list');
    const toDoColumn = columns[0];
    const inProgressColumn = columns[1];
    const doneColumn = columns[2];

    expect(columns).toHaveLength(3);
    expect(toDoColumn.children).toHaveLength(1);
    expect(toDoColumn.children[0]).toHaveTextContent(toDoTaskTitle);
    expect(inProgressColumn.children).toHaveLength(1);
    expect(inProgressColumn.children[0]).toHaveTextContent(inProgressTaskTitle);
    expect(doneColumn.children).toHaveLength(1);
    expect(doneColumn.children[0]).toHaveTextContent(doneTaskTitle);
  });

  it('should display an error message if id from params is not a valid uuid', () => {
    mockedUseParams.mockReturnValue({ id: '123' });

    renderComponent();

    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('should display an error message if fetching board data fails', async () => {
    server.use(http.get(`${apiUrl}/boards/${paramsId}`, () => HttpResponse.error()));

    const { waitForTheComponentToLoad } = renderComponent();
    await waitForTheComponentToLoad();

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
