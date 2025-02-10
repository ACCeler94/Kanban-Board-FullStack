import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BoardMenu from '../../../../src/components/features/Boards/BoardMenu/BoardMenu';
import AllProviders from '../../../AllProviders';
import { mockedUseParams } from '../../../utils';

describe('BoardMenu', () => {
  const renderComponent = (isAuthor: boolean = true) => {
    render(
      <MemoryRouter>
        <BoardMenu isAuthor={isAuthor} />
      </MemoryRouter>,
      { wrapper: AllProviders }
    );

    return {
      menuButton: screen.getByRole('button', { name: /menu/i }),
      getUsersOption: () => screen.queryByRole('menuitem', { name: /users/i }),
      getDeleteMenuItem: () => screen.queryByRole('menuitem', { name: /delete/i }),
      getEditMenuItem: () => screen.queryByRole('menuitem', { name: /edit/i }),
      user: userEvent.setup(),
    };
  };

  it('should render the button for opening the menu', () => {
    const { menuButton } = renderComponent();

    expect(menuButton).toBeInTheDocument();
  });

  it("should display a list of links when menu button is clicked and isAuthor is true (user is the board's author)", async () => {
    const menu = renderComponent();

    await menu.user.click(menu.menuButton);

    expect(menu.getUsersOption()).toBeInTheDocument();
    expect(menu.getEditMenuItem()).toBeInTheDocument();
    expect(menu.getDeleteMenuItem()).toBeInTheDocument();
  });

  it('should display only users link if the user is not the author', async () => {
    const menu = renderComponent(false);

    await menu.user.click(menu.menuButton);

    expect(menu.getUsersOption()).toBeInTheDocument();
    expect(menu.getEditMenuItem()).not.toBeInTheDocument();
    expect(menu.getDeleteMenuItem()).not.toBeInTheDocument();
  });

  it('should provide correct urls to the Link components', async () => {
    const boardId = '123';
    mockedUseParams.mockReturnValue({ id: boardId });
    const menu = renderComponent(true);

    await menu.user.click(menu.menuButton);

    expect(menu.getUsersOption()).toHaveAttribute('href', `/boards/${boardId}/users`);
    expect(menu.getEditMenuItem()).toHaveAttribute('href', `/boards/${boardId}/edit`);
    expect(menu.getDeleteMenuItem()).toHaveAttribute('href', `/boards/${boardId}/delete`);
  });
  it('should close the menu on click', async () => {
    const menu = renderComponent(true);
    await menu.user.click(menu.menuButton);

    await menu.user.click(menu.getUsersOption()!);

    expect(menu.menuButton).toBeInTheDocument();
    expect(menu.getUsersOption()).not.toBeInTheDocument();
    expect(menu.getEditMenuItem()).not.toBeInTheDocument();
    expect(menu.getDeleteMenuItem()).not.toBeInTheDocument();
  });
});
