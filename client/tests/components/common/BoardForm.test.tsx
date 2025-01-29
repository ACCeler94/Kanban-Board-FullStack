import { render, screen } from '@testing-library/react';
import BoardForm from '../../../src/components/common/BoardForm/BoardForm';
import userEvent from '@testing-library/user-event';

describe('BoardForm', () => {
  const renderComponent = (boardTitle?: string) => {
    const submitHandler = vi.fn();
    render(
      <BoardForm
        submitHandler={submitHandler}
        buttonText='submit'
        boardTitle={boardTitle ? boardTitle : undefined}
      />
    );

    return {
      submitHandler,
      user: userEvent.setup(),
      titleInput: screen.getByRole('textbox'),
      submitButton: screen.getByRole('button', { name: /submit/i }),
    };
  };

  it('should render a form with title input and submit button', () => {
    const { titleInput, submitButton } = renderComponent();
    const label = screen.getByText(/board title/i);

    expect(label).toBeInTheDocument();
    expect(titleInput).toBeInTheDocument();
    expect(titleInput).toHaveTextContent('');
    expect(submitButton).toBeInTheDocument();
  });

  it('should call submitHandler with the value of title input', async () => {
    const { submitHandler, titleInput, submitButton, user } = renderComponent();
    const title = 'abc';

    await user.type(titleInput, title);
    await user.click(submitButton);

    expect(submitHandler).toHaveBeenCalledWith(title);
  });

  it('should not call submitHandler if title is empty', async () => {
    const { submitHandler, titleInput, submitButton, user } = renderComponent();

    await user.click(submitButton);

    expect(titleInput).toHaveAttribute('required');
    expect(submitHandler).not.toHaveBeenCalled();
  });

  it('should call submitHandler with shortened title if user tried to type more than 100 characters', async () => {
    const { submitHandler, titleInput, submitButton, user } = renderComponent();

    await user.type(titleInput, 'a'.repeat(110));
    await user.click(submitButton);

    expect(titleInput).toHaveAttribute('MaxLength', '100');
    expect(submitHandler).toHaveBeenCalledWith('a'.repeat(100));
  });

  it('should not call submitHandler if the enter button is pressed', async () => {
    const { submitHandler, titleInput, user } = renderComponent();
    const title = 'abc';
    await user.type(titleInput, title);

    await user.type(titleInput, '{Enter}');

    expect(submitHandler).not.toBeCalled();
  });
});
