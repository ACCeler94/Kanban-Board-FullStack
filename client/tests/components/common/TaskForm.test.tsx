import { render, screen } from '@testing-library/react';
import TaskForm from '../../../src/components/common/TaskForm/TaskForm';
import { Subtask, TaskStatus, TaskType } from '../../../src/types/types';
import { db } from '../../mocks/db';
import userEvent from '@testing-library/user-event';

interface TaskFormProps {
  taskTitle?: string;
  taskDesc?: string;
  taskStatus?: TaskStatus;
  taskSubtasks?: Subtask[];
  buttonText: string;
}

describe('TaskForm', () => {
  const existingSubtasks: Subtask[] = [];
  let task: TaskType;

  beforeAll(() => {
    [1, 2].forEach(() => {
      const subtask = db.subtask.create();
      existingSubtasks.push(subtask);
    });
    task = db.task.create();
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
    db.task.delete({
      where: {
        id: { equals: task.id },
      },
    });
  });

  const renderComponent = ({
    taskTitle,
    taskDesc,
    taskStatus,
    taskSubtasks,
    buttonText,
  }: TaskFormProps) => {
    const submitHandler = vi.fn();

    render(
      <TaskForm
        taskTitle={taskTitle}
        taskDesc={taskDesc}
        taskStatus={taskStatus}
        taskSubtasks={taskSubtasks}
        buttonText={buttonText}
        submitHandler={submitHandler}
      />
    );

    return {
      titleInput: screen.getByRole('textbox', { name: /title/i }),
      descInput: screen.getByRole('textbox', { name: /description/i }),
      statusCombobox: screen.getByRole('combobox'),
      submitButton: screen.getByRole('button', { name: buttonText }),
      user: userEvent.setup(),
      newSubtaskInput: screen.getByPlaceholderText(/break down/i),
      addSubtaskButton: screen.getByRole('button', { name: /add/i }),
      getSubtaskInputs: () => screen.queryAllByLabelText(/edit subtask/i),
      submitHandler,
    };
  };

  it('should render title, description, status select and submit button with proper attributes', () => {
    const form = renderComponent({ buttonText: 'Create new task' });

    expect(form.titleInput).toHaveAttribute('required');
    expect(form.titleInput).toHaveAttribute('maxLength', '100');
    expect(form.descInput).toHaveAttribute('maxLength', '500');
    expect(form.statusCombobox).toBeInTheDocument();
    expect(form.submitButton).toBeDisabled();
  });

  it('should render combobox with proper values', async () => {
    const { user, statusCombobox } = renderComponent({ buttonText: 'Create new task' });
    await user.click(statusCombobox); // Click to open combobox

    expect(screen.getByRole('option', { name: /to do/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /in progress/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /done/i })).toBeInTheDocument();
  });

  it('should populate the form with task data when editing task', () => {
    const form = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
      taskDesc: task.desc,
      taskStatus: TaskStatus.IN_PROGRESS,
    });

    expect(form.titleInput).toHaveValue(task.title);
    expect(form.descInput).toHaveValue(task.desc);
    expect(form.statusCombobox).toHaveTextContent(/in progress/i);
  });

  it('should enable submit button if task data has been changed', async () => {
    const { user, descInput, submitButton } = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
      taskDesc: task.desc,
      taskStatus: TaskStatus.IN_PROGRESS,
    });

    await user.type(descInput, 'abc');

    expect(submitButton).not.toBeDisabled();
  });

  it('should disable submit button again if edited data is the same as initial data', async () => {
    const { user, descInput, submitButton } = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
      taskDesc: task.desc,
      taskStatus: TaskStatus.IN_PROGRESS,
    });
    await user.type(descInput, 'abc');
    await user.clear(descInput);

    await user.type(descInput, task.desc);

    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button if required title is empty', () => {
    const { submitButton } = renderComponent({ buttonText: 'Create new task' });

    expect(submitButton).toBeDisabled();
  });

  it('should call submit handler with proper data when creating new task', async () => {
    const form = renderComponent({
      buttonText: 'Create new task',
    });
    const newTitle = 'abc';
    const newDesc = 'cde';

    await form.user.type(form.titleInput, newTitle);
    await form.user.type(form.descInput, newDesc);
    await form.user.click(form.submitButton);

    expect(form.submitHandler).toHaveBeenCalledWith({
      taskData: { title: newTitle, desc: newDesc, status: task.status },
      subtaskData: [],
    });
  });

  it('should call submit handler with proper data when editing the task', async () => {
    const form = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
      taskDesc: task.desc,
      taskStatus: TaskStatus.IN_PROGRESS,
    });
    const newTitle = 'abc';
    const newDesc = 'cde';

    await form.user.clear(form.titleInput);
    await form.user.type(form.titleInput, newTitle);
    await form.user.clear(form.descInput);
    await form.user.type(form.descInput, newDesc);
    await form.user.click(form.statusCombobox);
    await form.user.click(screen.getByRole('option', { name: /done/i }));
    await form.user.click(form.submitButton);

    expect(form.submitHandler).toHaveBeenCalledWith({
      taskData: { title: newTitle, desc: newDesc, status: TaskStatus.DONE },
      subtaskData: [],
    });
  });

  it('should not call submit handler when enter is pressed within the input fields', async () => {
    const form = renderComponent({
      buttonText: 'Create new task',
    });

    await form.user.type(form.titleInput, 'abc'); // Fill in required input field
    await form.user.type(form.titleInput, '{Enter}');
    await form.user.type(form.descInput, '{Enter}');

    expect(form.submitHandler).not.toHaveBeenCalled();
  });

  it('should add subtask with correct description on add button click', async () => {
    const { user, addSubtaskButton, newSubtaskInput, getSubtaskInputs } = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
    });
    const subtaskText = 'This is a new subtask';

    expect(getSubtaskInputs().length).toBe(0); // No inputs for existing subtasks initially

    await user.type(newSubtaskInput, subtaskText);
    await user.click(addSubtaskButton);

    expect(screen.getByDisplayValue(subtaskText)).toBeInTheDocument();
    expect(newSubtaskInput).toHaveValue(''); // Check if the input is reset after adding a new subtask
  });

  it('should add subtask with correct description on {Enter} key down', async () => {
    const { user, newSubtaskInput } = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
    });
    const subtaskText = 'This is a new subtask';

    await user.type(newSubtaskInput, subtaskText);
    await user.type(newSubtaskInput, '{Enter}');

    expect(screen.getByDisplayValue(subtaskText)).toBeInTheDocument();
    expect(newSubtaskInput).toHaveValue(''); // Check if the input is reset after adding a new subtask
  });

  it('should allow editing existing subtask', async () => {
    const { user } = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
      taskSubtasks: existingSubtasks,
    });
    const subtaskText = 'Edited subtask text';
    const subtaskToEdit = screen.getByDisplayValue(existingSubtasks[0].desc);

    await user.clear(subtaskToEdit);
    await user.type(subtaskToEdit, subtaskText);

    expect(screen.getByDisplayValue(subtaskText)).toBeInTheDocument();
  });

  it('should delete subtask when related delete button is clicked', async () => {
    const { user } = renderComponent({
      buttonText: 'Save changes',
      taskTitle: task.title,
      taskSubtasks: existingSubtasks,
    });
    const deleteButton = screen.getByRole('button', {
      name: `Delete Subtask ${existingSubtasks[0].id}`,
    });

    expect(screen.getByDisplayValue(existingSubtasks[0].desc)).toBeInTheDocument(); // Ensure that subtask is rendered
    await user.click(deleteButton);

    expect(screen.queryByDisplayValue(existingSubtasks[0].desc)).not.toBeInTheDocument();
  });
});
