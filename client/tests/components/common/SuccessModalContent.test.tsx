import { Dialog } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllProviders from '../../AllProviders';
import SuccessModalContent from '../../../src/components/common/SuccessModalContent/SuccessModalContent';

describe('SuccessModalContent', () => {
  const successMessage = 'User added successfully!';
  const renderComponent = () => {
    const handleClose = vi.fn();

    render(
      <Dialog open>
        <SuccessModalContent successMessage={successMessage} handleClose={handleClose} />
      </Dialog>,
      { wrapper: AllProviders }
    );

    return {
      handleClose,
      user: userEvent.setup(),
      closeBtn: screen.getByRole('button', { name: /close modal/i }),
    };
  };

  it('should render dialog with correct header and message', () => {
    renderComponent();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /success/i })).toBeInTheDocument();
    expect(screen.getByText(successMessage));
  });

  it('should render close modal button', () => {
    const { closeBtn } = renderComponent();

    expect(closeBtn).toBeInTheDocument();
  });

  it('should call handleClose if close button is clicked', async () => {
    const { handleClose, user, closeBtn } = renderComponent();

    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
