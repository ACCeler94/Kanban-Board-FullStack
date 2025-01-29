import { Dialog } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDeletionModalContent from '../../../src/components/common/ConfirmDeleteModalContent/ConfirmDeleteModalContent';
import deletionModalStyles from '../../../src/components/common/ConfirmDeleteModalContent/ConfirmDeleteModalContent.module.css';
import AllProviders from '../../AllProviders';

describe('ConfirmDeletionModalContent', () => {
  const renderComponent = (subject: string) => {
    const handleDelete = vi.fn();
    const handleClose = vi.fn();

    render(
      <Dialog open>
        <ConfirmDeletionModalContent
          deletionSubject={subject}
          handleDelete={handleDelete}
          handleClose={handleClose}
        />
      </Dialog>,
      { wrapper: AllProviders }
    );

    return {
      handleClose,
      handleDelete,
      user: userEvent.setup(),
      cancelBtn: screen.getByRole('button', { name: /cancel/i }),
      deleteBtn: screen.getByRole('button', { name: /delete/i }),
      closeBtn: screen.getByRole('button', { name: /close modal/i }),
    };
  };

  it('should render dialog with correct header and message', () => {
    renderComponent('user');

    const elements = screen.getAllByText(/user/i);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /user/i })).toBeInTheDocument();
    expect(elements).toHaveLength(2);
    expect(
      elements.some((element) => element.className === deletionModalStyles.deleteMessage)
    ).toBeTruthy();
  });

  it('should render delete and cancel buttons', () => {
    const { deleteBtn, cancelBtn } = renderComponent('user');

    expect(cancelBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();
  });

  it('should render close modal button', () => {
    const { closeBtn } = renderComponent('user');

    expect(closeBtn).toBeInTheDocument();
  });

  it('should call handleDelete when delete button is clicked', async () => {
    const { handleDelete, user, deleteBtn } = renderComponent('user');

    await user.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalled();
  });

  it('should call handleClose if cancel button is clicked', async () => {
    const { handleClose, user, cancelBtn } = renderComponent('user');

    await user.click(cancelBtn);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should call handleClose if close button is clicked', async () => {
    const { handleClose, user, closeBtn } = renderComponent('user');

    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
