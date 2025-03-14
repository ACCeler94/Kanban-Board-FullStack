import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UsersList from '../../../../src/components/features/Users/UsersList/UsersList';
import { User } from '../../../../src/types/types';
import AllProviders from '../../../AllProviders';
import { db } from '../../../mocks/db';
import { mockAuthState } from '../../../utils';
import userEvent from '@testing-library/user-event';

describe('UsersList', () => {
  const users: User[] = [];
  const addUser = vi.fn();
  const setIsNestedOpen = vi.fn();
  const setUserIdToDelete = vi.fn();

  const renderComponent = ({
    isEditable,
    usersArr,
  }: {
    isEditable: boolean;
    usersArr?: User[];
  }) => {
    render(
      <MemoryRouter>
        <UsersList
          users={usersArr ? usersArr : users}
          isEditable={isEditable}
          setIsNestedOpen={setIsNestedOpen}
          setUserIdToDelete={setUserIdToDelete}
          addUser={addUser}
        />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      user: userEvent.setup(),
      emailInput: screen.queryByRole('textbox'),
      addButton: screen.queryByRole('button', { name: /add/i }),
      deleteButtons: screen.queryAllByRole('button', { name: /delete/i }),
    };
  };

  beforeAll(() => {
    [1, 2].forEach(() => {
      const user = db.user.create();
      users.push(user);
    });
  });

  beforeEach(() => {
    mockAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '',
        auth0Sub: '111',
      },
    });

    vi.resetAllMocks();
  });

  it('should render "No assigned users" message if the users array is empty', () => {
    renderComponent({ isEditable: true, usersArr: [] });

    expect(screen.getByText(/no assigned users/i)).toBeInTheDocument();
  });

  it('should render the name, email and avatar for each user', () => {
    renderComponent({ isEditable: true });

    users.forEach((u) => {
      expect(screen.getByText(u.name)).toBeInTheDocument();
      expect(screen.getByText(u.email)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('img').length).toBe(2);
  });

  it('should render delete button for each user and email input field with add button if isEditable === true', () => {
    const { emailInput, addButton, deleteButtons } = renderComponent({ isEditable: true });

    expect(deleteButtons.length).toBe(2);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(addButton).toBeInTheDocument();
  });

  it('should not render delete buttons and email input field with add button if isEditable === false', () => {
    const { emailInput, addButton, deleteButtons } = renderComponent({ isEditable: false });

    expect(deleteButtons.length).toBe(0);
    expect(emailInput).not.toBeInTheDocument();
    expect(addButton).not.toBeInTheDocument();
  });

  it('should call setIsNestedOpen with value true (to open nested confirmation modal) and setUserIdToDelete with correct user.id when delete btn is clicked', async () => {
    const { deleteButtons, user } = renderComponent({ isEditable: true });

    await user.click(deleteButtons[1]);

    expect(setIsNestedOpen).toHaveBeenCalledWith(true);
    expect(setUserIdToDelete).toHaveBeenCalledWith(users[1].id);
  });

  it('should call addUser with the correct user email when add button is clicked', async () => {
    const userEmail = 'abc@gmail.com';
    const { emailInput, user, addButton } = renderComponent({ isEditable: true });

    await user.type(emailInput!, userEmail);
    await user.click(addButton!);

    expect(addUser).toHaveBeenCalledWith(userEmail);
  });

  it('should call addUser with the correct user email when enter button is pressed', async () => {
    const userEmail = 'abc@gmail.com';
    const { emailInput, user } = renderComponent({ isEditable: true });

    await user.type(emailInput!, userEmail + '[Enter]');

    expect(addUser).toHaveBeenCalledWith(userEmail);
  });

  it('should not call addUser if the input field is empty', async () => {
    const { emailInput, user, addButton } = renderComponent({ isEditable: true });

    await user.click(addButton!);
    await user.type(emailInput!, '[Enter]'); // Enter is pressed with an empty input field

    expect(addUser).not.toHaveBeenCalled();
  });

  it('should not call addUser if typed text is not an email', async () => {
    const { emailInput, user, addButton } = renderComponent({ isEditable: true });

    await user.type(emailInput!, 'abcdef');
    await user.click(addButton!);

    expect(addUser).not.toHaveBeenCalled();
  });

  it('should not call addUser if typed text is too short (shorter than 5 chars)', async () => {
    const { emailInput, user, addButton } = renderComponent({ isEditable: true });

    await user.type(emailInput!, 'abc');
    await user.click(addButton!);

    expect(addUser).not.toHaveBeenCalled();
  });

  it('should not call addUser if typed text is too long (longer than 64 chars)', async () => {
    const { emailInput, user, addButton } = renderComponent({ isEditable: true });
    const text = 'a'.repeat(65) + '@gmail.com';

    await user.type(emailInput!, text);
    await user.click(addButton!);

    expect(addUser).not.toHaveBeenCalled();
  });
});
