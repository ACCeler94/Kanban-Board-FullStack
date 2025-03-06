import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskCard from '../../../../src/components/features/Tasks/TaskCard/TaskCard';
import { TaskType } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';

describe('TaskCard', () => {
  const task = db.task.create();

  const renderComponent = (task: TaskType) => {
    render(
      <MemoryRouter>
        <TaskCard taskData={task} />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );
  };

  it('should render a link to tasks/:taskId, task title and drag handle', () => {
    renderComponent(task);
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/tasks/${task.id}`);
    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByLabelText(/drag handle/i)).toBeInTheDocument();
  });

  it('should display no subtasks if there are no subtasks assigned to the task', () => {
    renderComponent(task);

    expect(screen.getByText(/no subtasks/i)).toBeInTheDocument();
  });

  it('should display a number of finished subtasks out of all subtasks (0 finished out of 2)', () => {
    const subtask1 = db.subtask.create();
    const subtask2 = db.subtask.create();
    const taskWithSubtasks: TaskType = { ...task, subtasks: [subtask1, subtask2] };
    renderComponent(taskWithSubtasks);

    expect(screen.getByText(/0 of 2/i)).toBeInTheDocument();
  });

  it('should display a number of finished subtasks out of all subtasks (1 finished out of 2)', () => {
    const subtask1 = db.subtask.create();
    const subtask2 = db.subtask.create({ finished: true });
    const taskWithSubtasks: TaskType = { ...task, subtasks: [subtask1, subtask2] };
    renderComponent(taskWithSubtasks);

    expect(screen.getByText(/1 of 2/i)).toBeInTheDocument();
  });

  it('should display no assigned users message if there are no users assigned to the task', () => {
    renderComponent(task);

    expect(screen.getByText(/no assigned users.../i)).toBeInTheDocument();
  });

  it('should display the name of the user assigned to the task', () => {
    const user = db.user.create();
    const taskWithUser = { ...task, assignedUsers: [{ user: user }] };

    renderComponent(taskWithUser);

    expect(screen.getByText(user.name)).toBeInTheDocument();
  });

  it('should display the name of the user + "and 1 other..." message if there are 2 assigned users', () => {
    const user1 = db.user.create();
    const user2 = db.user.create();
    const taskWithUsers = { ...task, assignedUsers: [{ user: user1 }, { user: user2 }] };

    renderComponent(taskWithUsers);

    expect(screen.getByText(`${user1.name} and 1 other...`)).toBeInTheDocument();
  });

  it('should display the name of the user + "and (number of assigned users - 1) others...', () => {
    const user1 = db.user.create();
    const user2 = db.user.create();
    const user3 = db.user.create();
    const taskWithUsers = {
      ...task,
      assignedUsers: [{ user: user1 }, { user: user2 }, { user: user3 }],
    };

    renderComponent(taskWithUsers);

    expect(screen.getByText(`${user1.name} and 2 others...`)).toBeInTheDocument();
  });
});
