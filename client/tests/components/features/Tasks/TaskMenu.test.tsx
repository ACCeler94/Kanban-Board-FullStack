import { render, screen } from '@testing-library/react';
import TaskMenu from '../../../../src/components/features/Tasks/TaskModal/TaskMenu/TaskMenu';
import { MemoryRouter } from 'react-router-dom';
import AllProviders from '../../../AllProviders';
import userEvent from '@testing-library/user-event';

describe('TaskMenu', () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <TaskMenu />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );
    return {
      menuButton: screen.getByRole('button'),
    };
  };

  it('should render a menu button ', () => {
    const { menuButton } = renderComponent();

    expect(menuButton).toBeInTheDocument();
  });

  it('should open a menu on click with Users, Edit, Delete links', async () => {
    const { menuButton } = renderComponent();
    const user = userEvent.setup();

    await user.click(menuButton);
    const usersItem = screen.getByRole('menuitem', { name: /users/i });
    const editItem = screen.getByRole('menuitem', { name: /edit/i });
    const deleteItem = screen.getByRole('menuitem', { name: /delete/i });

    expect(usersItem).toBeInTheDocument();
    expect(usersItem).toHaveAttribute('href', '/users');
    expect(editItem).toBeInTheDocument();
    expect(editItem).toHaveAttribute('href', '/edit');
    expect(deleteItem).toBeInTheDocument();
    expect(deleteItem).toHaveAttribute('href', '/delete');
  });
});
