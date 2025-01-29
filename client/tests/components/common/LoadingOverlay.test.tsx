import { render, screen } from '@testing-library/react';
import LoadingOverlay from '../../../src/components/common/LoadingOverlay/LoadingOverlay';
import AllProviders from '../../AllProviders';

describe('LoadingOverlay', () => {
  it('should render a loading spinner', () => {
    render(<LoadingOverlay />, { wrapper: AllProviders });

    expect(screen.queryByLabelText(/loading spinner/i)).toBeInTheDocument();
  });
});
