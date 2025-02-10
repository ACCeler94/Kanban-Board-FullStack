import { Dialog } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllProviders from '../../AllProviders';
import ErrorModalContent from '../../../src/components/common/ErrorModalContent/ErrorModalContent';

describe('ErrorModalContent', () => {
  const renderComponent = (error: Error | string) => {
    const handleClose = vi.fn();

    render(
      <Dialog open>
        <ErrorModalContent error={error} handleClose={handleClose} />
      </Dialog>,
      { wrapper: AllProviders }
    );

    return {
      handleClose,
      user: userEvent.setup(),
      closeBtn: screen.getByRole('button', { name: /close modal/i }),
    };
  };

  it('should render dialog with correct header', () => {
    const error = new Error('abc');
    renderComponent(error);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /error/i })).toBeInTheDocument();
  });

  it('should display the correct message if the error is in the Error format', () => {
    const error = new Error('abc');
    renderComponent(error);

    expect(screen.getByText(`Error: ${error.message}`));
  });

  it('should display the correct message if the error is passed as a string', () => {
    const error = 'abc';
    renderComponent(error);

    expect(screen.getByText(`Error: ${error}`));
  });

  it('should render close modal button', () => {
    const { closeBtn } = renderComponent(new Error());

    expect(closeBtn).toBeInTheDocument();
  });

  it('should call handleClose if close button is clicked', async () => {
    const { handleClose, user, closeBtn } = renderComponent(new Error());

    await user.click(closeBtn);

    expect(handleClose).toHaveBeenCalled();
  });
});
