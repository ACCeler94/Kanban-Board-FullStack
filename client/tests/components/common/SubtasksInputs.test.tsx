import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubtasksInputs from '../../../src/components/common/TaskForm/SubtasksInputs/SubtasksInputs';
import { NewSubtaskData, Subtask } from '../../../src/types/types';
import { db } from '../../mocks/db';

interface Props {
  subtasks: (Subtask | NewSubtaskData)[];
  originalSubtasks: Subtask[] | [];
}

// User interactions tested within parent component
describe('SubtasksInputs', () => {
  const existingSubtasks: Subtask[] = [];
  beforeAll(() => {
    [1, 2].forEach(() => {
      const subtask = db.subtask.create();
      existingSubtasks.push(subtask);
    });
  });

  afterAll(() => {
    const subtaskIds = existingSubtasks.map((s) => s.id);
    db.subtask.deleteMany({
      where: {
        id: {
          in: subtaskIds,
        },
      },
    });
  });

  const renderComponent = ({ subtasks, originalSubtasks }: Props) => {
    const setSubtasks = vi.fn();
    render(
      <SubtasksInputs
        subtasks={subtasks}
        originalSubtasks={originalSubtasks}
        setSubtasks={setSubtasks}
      />
    );

    return {
      user: userEvent.setup(),
      newSubtaskInput: screen.getByLabelText(/new subtask/i),
      addButton: screen.getByRole('button', { name: /add/i }),
      setSubtasks,
    };
  };

  it('should render subtask input and delete button for every existing subtask', () => {
    renderComponent({ subtasks: existingSubtasks, originalSubtasks: existingSubtasks });

    const subtaskInputs = screen.getAllByLabelText(/edit subtask/i);
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

    expect(subtaskInputs.length).toBe(2);
    expect(deleteButtons.length).toBe(2);
    // Check that each subtask's description is displayed in an input
    existingSubtasks.forEach((subtask) => {
      expect(screen.getByDisplayValue(subtask.desc)).toBeInTheDocument();
    });
  });

  it('should render inputs for existing subtasks with attribute required ', () => {
    renderComponent({ subtasks: existingSubtasks, originalSubtasks: existingSubtasks });

    existingSubtasks.forEach((subtask) => {
      expect(screen.getByDisplayValue(subtask.desc)).toHaveAttribute('required');
    });
  });

  it('should render a new subtask input with add button', () => {
    const { addButton, newSubtaskInput } = renderComponent({ subtasks: [], originalSubtasks: [] });

    expect(addButton).toBeInTheDocument();
    expect(newSubtaskInput).toBeInTheDocument();
  });

  it('should render subtask inputs with max length 200 attribute', () => {
    renderComponent({ subtasks: existingSubtasks, originalSubtasks: existingSubtasks });

    const inputs = screen.getAllByRole('textbox');

    inputs.forEach((i) => {
      expect(i).toHaveAttribute('maxLength', '200');
    });
  });
});
