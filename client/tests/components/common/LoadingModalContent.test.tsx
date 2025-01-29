import { Dialog } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoadingModalContent from '../../../src/components/common/LoadingModalContent/LoadingModalContent';
import AllProviders from '../../AllProviders';

describe('ErrorModalContent', () => {
  const renderComponent = () => {
    const handleClose = vi.fn();

    render(
      <Dialog open>
        <LoadingModalContent handleClose={handleClose} />
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
    expect(screen.getByRole('heading', { name: /loading/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/loading/i));
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
