import { render, screen } from '@testing-library/react';
import SubtasksList from '../../../../src/components/features/Tasks/TaskModal/SubtasksList/SubtasksList';
import { Subtask } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import userEvent from '@testing-library/user-event';

describe('SubtasksList', () => {
  const setIsModified = vi.fn();
  const setSubtaskData = vi.fn();
  const subtasks: Subtask[] = [];

  const renderComponent = (subtasksArray?: Subtask[]) => {
    render(
      <SubtasksList
        subtasks={subtasksArray ? subtasksArray : subtasks}
        setIsModified={setIsModified}
        setSubtaskData={setSubtaskData}
      />,
      { wrapper: AllProviders }
    );

    return {
      checkboxes: screen.getAllByRole('checkbox'),
      listItems: screen.getAllByRole('listitem'),
      user: userEvent.setup(),
    };
  };

  beforeAll(() => {
    [1, 2].forEach(() => {
      const subtask = db.subtask.create();
      subtasks.push(subtask);
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display a heading, a list of subtasks wih subtasks descriptions and checkboxes to track their status', () => {
    const { listItems, checkboxes } = renderComponent();

    expect(screen.getByRole('heading', { name: /subtasks/i })).toBeInTheDocument();
    expect(screen.getByText(subtasks[0].desc)).toBeInTheDocument();
    expect(screen.getByText(subtasks[1].desc)).toBeInTheDocument();
    expect(listItems.length).toBe(2);
    expect(checkboxes.length).toBe(2);
  });

  it('should render checkbox as not checked if subtask status is unfinished', () => {
    const { checkboxes } = renderComponent();

    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it('should render checkbox as checked if subtask status is finished', () => {
    const subtask = db.subtask.create({ finished: true });
    renderComponent([subtask]); // Pass a subtask with finished: true as subtaskArray

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should change subtask status if corresponding li element is clicked', async () => {
    const { user, listItems, checkboxes } = renderComponent();

    await user.click(listItems[0]);

    expect(checkboxes[0]).toBeChecked();
  });

  it('should call setIsModified with value true if the status of at least one subtask changes', async () => {
    const { user, listItems } = renderComponent();

    await user.click(listItems[0]);

    expect(setIsModified).toHaveBeenCalledWith(true);
  });

  it('should call setIsModified again with value false if the status is reverted to its original value', async () => {
    const { user, listItems } = renderComponent();
    await user.click(listItems[0]); // Check to mark subtask as finished

    await user.click(listItems[0]); // Click again to revert to original (unfinished) status

    expect(setIsModified).toHaveBeenCalledWith(false);
  });

  it('should call setIsModified with a value true as the last call if one of the subtasks has been reverted to the original state', async () => {
    const { user, listItems } = renderComponent();
    await user.click(listItems[0]); // Click to mark 1st subtask as finished
    await user.click(listItems[1]); // Click to mark 2nd subtask as finished
    await user.click(listItems[0]); // Click first item again to mark as unfinished again

    const setIsModifiedCalls = setIsModified.mock.calls.length;

    expect(setIsModifiedCalls).toBe(2); // One call on mount with, second as a reaction to user changes
    expect(setIsModified.mock.calls[1][0]).toBe(true); // The last call should be true as one of the subtasks is still modified
  });

  it('should call setSubtaskData with correct arguments when the subtask status changes', async () => {
    const { user, listItems } = renderComponent();

    await user.click(listItems[0]);
    const updatedSubtasks = subtasks.map((subtask) =>
      subtask.id === subtasks[0].id ? { ...subtask, finished: true } : subtask
    );

    expect(setSubtaskData).toHaveBeenCalledWith(updatedSubtasks);
  });
});
